use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Burn, MintTo};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Constants
const SECONDS_PER_DECAY: i64 = 3600; // 1 Hour
const MAX_STAT: u8 = 100;
const MIN_STAT: u8 = 0;
const HUNGER_DECAY: u8 = 5;
const HAPPINESS_DECAY: u8 = 5;
const STRENGTH_DECAY: u8 = 2;

const COST_FEED: u64 = 10 * 1_000_000; // 10 Tokens
const COST_TRAIN: u64 = 15 * 1_000_000; // 15 Tokens
const REWARD_CLEAN: u64 = 5 * 1_000_000; // 5 Tokens

#[program]
pub mod nftagachi {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.admin = ctx.accounts.admin.key();
        global_state.reward_mint = ctx.accounts.reward_mint.key();
        Ok(())
    }

    pub fn initialize_pet(ctx: Context<InitializePet>, _pet_mint: Pubkey) -> Result<()> {
        let pet = &mut ctx.accounts.pet;
        pet.owner = ctx.accounts.user.key();
        pet.stats = PetStats {
            hunger: 0, // 0 is full, 100 is starving
            strength: 50,
            happiness: 100,
            energy: 100,
        };
        pet.last_interacted = Clock::get()?.unix_timestamp;
        pet.pending_rewards = 0;
        msg!("Pet initialized!");
        Ok(())
    }

    pub fn feed(ctx: Context<Interact>) -> Result<()> {
        let pet = &mut ctx.accounts.pet;
        update_stats(pet)?;
        
        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::burn(cpi_ctx, COST_FEED)?;

        // Feed logic: Decrease hunger, small boost to energy
        pet.stats.hunger = pet.stats.hunger.saturating_sub(20);
        pet.stats.energy = (pet.stats.energy + 5).min(MAX_STAT);
        
        emit!(PetInteracted {
            pet: pet.key(),
            action: ActionType::Feed,
        });
        
        Ok(())
    }

    pub fn train(ctx: Context<Interact>) -> Result<()> {
        let pet = &mut ctx.accounts.pet;
        update_stats(pet)?;
        
        // Check energy
        require!(pet.stats.energy >= 20, PetError::Tired);

        // Burn tokens
        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::burn(cpi_ctx, COST_TRAIN)?;

        // Train logic
        pet.stats.strength = (pet.stats.strength + 10).min(MAX_STAT);
        pet.stats.energy = pet.stats.energy.saturating_sub(20);
        pet.stats.hunger = (pet.stats.hunger + 10).min(MAX_STAT);
        
        emit!(PetInteracted {
            pet: pet.key(),
            action: ActionType::Train,
        });

        Ok(())
    }

    pub fn clean(ctx: Context<Interact>) -> Result<()> {
        let pet = &mut ctx.accounts.pet;
        update_stats(pet)?;

        let seeds = &[b"global".as_ref(), &[ctx.bumps.global_state]];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.global_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer);
        token::mint_to(cpi_ctx, REWARD_CLEAN)?;
        
        pet.stats.happiness = (pet.stats.happiness + 20).min(MAX_STAT);
        
        emit!(PetInteracted {
            pet: pet.key(),
            action: ActionType::Clean,
        });

        Ok(())
    }

    pub fn mint_skin(ctx: Context<MintSkin>, seed: String, variant_id: String, tier: String) -> Result<()> {
        let skin = &mut ctx.accounts.skin;
        skin.owner = ctx.accounts.user.key();
        skin.variant_id = variant_id;
        skin.tier = tier;
        skin.mint_time = Clock::get()?.unix_timestamp;
        msg!("Skin minted on-chain!");
        Ok(())
    }

    pub fn mint_background(ctx: Context<MintBackground>, seed: String, bg_id: String, tier: String) -> Result<()> {
        let background = &mut ctx.accounts.background;
        background.owner = ctx.accounts.user.key();
        background.bg_id = bg_id;
        background.tier = tier;
        background.mint_time = Clock::get()?.unix_timestamp;
        msg!("Background minted on-chain!");
        Ok(())
    }
}

// Helper to calculate decay storage_time
fn update_stats(pet: &mut Account<Pet>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let time_diff = now - pet.last_interacted;
    
    let intervals = (time_diff / SECONDS_PER_DECAY) as u8;
    
    if intervals > 0 {
        pet.stats.hunger = (pet.stats.hunger + (intervals * HUNGER_DECAY)).min(MAX_STAT);
        pet.stats.happiness = pet.stats.happiness.saturating_sub(intervals * HAPPINESS_DECAY);
        pet.stats.strength = pet.stats.strength.saturating_sub(intervals * STRENGTH_DECAY);
        pet.last_interacted = now;
    }
    
    // Check death condition? For now just clamp.
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32,
        seeds = [b"global"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    pub reward_mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(pet_mint: Pubkey)]
pub struct InitializePet<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + (1 + 1 + 1 + 1) + 8 + 8 + 64, // Added energy + pending_rewards
        seeds = [b"pet", pet_mint.key().as_ref()],
        bump
    )]
    pub pet: Account<'info, Pet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Interact<'info> {
    #[account(mut, has_one = owner)]
    pub pet: Account<'info, Pet>,
    #[account(mut)]
    pub owner: Signer<'info>,
    
    // Tokenomics
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut, address = global_state.reward_mint)]
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        seeds = [b"global"],
        bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(seed: String)]
pub struct MintSkin<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 64 + 32 + 8, // owner + variant_id + tier + mint_time
        seeds = [b"skin", user.key().as_ref(), seed.as_bytes()],
        bump
    )]
    pub skin: Account<'info, Skin>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(seed: String)]
pub struct MintBackground<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 64 + 32 + 8, // owner + bg_id + tier + mint_time
        seeds = [b"background", user.key().as_ref(), seed.as_bytes()],
        bump
    )]
    pub background: Account<'info, Background>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Skin {
    pub owner: Pubkey,
    pub variant_id: String,
    pub tier: String,
    pub mint_time: i64,
}

#[account]
pub struct Background {
    pub owner: Pubkey,
    pub bg_id: String,
    pub tier: String,
    pub mint_time: i64,
}


#[account]
pub struct GlobalState {
    pub admin: Pubkey,
    pub reward_mint: Pubkey,
}

#[account]
pub struct Pet {
    pub owner: Pubkey,
    pub stats: PetStats,
    pub last_interacted: i64,
    pub pending_rewards: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct PetStats {
    pub hunger: u8,
    pub strength: u8,
    pub happiness: u8,
    pub energy: u8,
}

#[event]
pub struct PetInteracted {
    pub pet: Pubkey,
    pub action: ActionType,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum ActionType {
    Feed,
    Train,
    Clean,
    Fight
}

#[error_code]
pub enum PetError {
    #[msg("Pet is too tired to train.")]
    Tired,
}
