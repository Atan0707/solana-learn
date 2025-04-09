use anchor_lang::prelude::*;

declare_id!("HArkwfpv6ETBeZrGpeb2meybYfbVFbMvHpRSa2Fq54L2");

#[program]
pub mod contract_cpi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
