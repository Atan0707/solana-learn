use anchor_lang::prelude::*;

declare_id!("9Nu9W9e6D7fKP7omiWw8Z14J1NnWpVjqWp7FwJ7J7wCQ");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
