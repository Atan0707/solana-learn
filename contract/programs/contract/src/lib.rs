use anchor_lang::prelude::*;

declare_id!("4r6tCfcZddGA72vHBoCSB35oCYu7Ftqr3E7Psy2bfj8V");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.authority.key();

        msg!("Counter initialized with count: {} and authority: {}", counter.count, counter.authority);

        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result <()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;

        msg!("Counter incremented to: {}", counter.count);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 8 + 32)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
}