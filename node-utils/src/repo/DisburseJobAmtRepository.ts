import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDatabaseService } from '../interfaces/services/IDatabaseService';
import { IDisburseJobAmtRepository } from '../interfaces/repo/IDisburseJobAmtRepository';
import { JobGuards } from '../entities/JobGuards';
import { TeamMembers } from '../entities/TeamMembers';
import { UserStripeDetails } from '../entities/UserStripeDetails';

@injectable()
export class DisburseJobAmtRepository implements IDisburseJobAmtRepository {
  constructor(
    @inject(TYPES.IDatabaseService)
    private readonly database: IDatabaseService
  ) {}

  async getJobGuards(): Promise<any> {
    const repo = await this.database.getRepository(JobGuards);
    const currentDate = new Date();

    console.log('currentDate', currentDate);

    return await repo
      .createQueryBuilder('jobGuards')
      .innerJoin('jobGuards.job', 'job')
      .innerJoin('jobGuards.user', 'jobUser')
      .innerJoin(
        'user_stripe_details',
        'stripeAccountUser',
        'stripeAccountUser.userId = jobUser.id'
      )
      .innerJoin(
        'user_profile',
        'userProfile',
        'userProfile.userId = jobUser.id'
      )
      .select([
        'job.job_name as jobName',
        'job.id as jobId',
        'job.jobRefId as jobRefId',
        'job.userId as userId',
        'job.paymentType as paymentType',
        'job.paymentMethod as paymentMethod',
        'job.last4 as last4',
        'job.stripeChargeId as stripeChargeId',
        'jobGuards.userId as paidTo',
        'jobGuards.totalJobAmount as totalJobAmount',
        'jobGuards.id as jobGuardId',
        // 'jobGuards.teamId as teamId',
        'stripeAccountUser.stripeAccountId as stripeAccountId',
        'userProfile.firstName as firstName',
        'userProfile.lastName as lastName',
        'jobUser.email as email',
      ])
      .where('jobGuards.jobCompletedDate IS NOT NULL')
      .andWhere(
        'DATE_ADD(jobGuards.jobCompletedDate, INTERVAL 48 HOUR) < :currentDate',
        {
          currentDate,
        }
      )
      .andWhere('jobGuards.transferStatus = 0')
      .andWhere('jobGuards.jobStatus = 3')
      .andWhere('jobGuards.teamId IS NULL')
      .andWhere('stripeAccountUser.isStripeVerified = 1')
      .andWhere('stripeAccountUser.status = 1')
      .andWhere('stripeAccountUser.stripeAccountId IS NOT NULL')
      // .orWhere((qb) => {
      //   qb.andWhere('jobGuards.teamId IS NOT NULL').andWhere((qb2) => {
      //     qb2
      //       .andWhere('jobGuards.isLead = 1')
      //       .andWhere('jobGuards.jobId = job.id')
      //       .andWhere('jobGuards.transferStatus = 0')
      //       .andWhere((qb3) => {
      //         qb3
      //           .andWhere('jobGuards.jobStatus = 0')
      //           .orWhere('jobGuards.jobStatus = 1');
      //       });
      //   });
      // })
      .take(3)
      .getRawMany();
  }
  async getJobTeamGuards(value: any): Promise<any> {
    const repo = await this.database.getRepository(JobGuards);
    const currentDate = new Date();
    return await repo
      .createQueryBuilder('jobGuards')
      .innerJoin('jobGuards.job', 'job')
      .innerJoin('jobGuards.user', 'jobUser')
      .innerJoin(
        'user_stripe_details',
        'stripeAccountUser',
        'stripeAccountUser.userId = jobUser.id'
      )
      .innerJoin(
        'user_profile',
        'userProfile',
        'userProfile.userId = jobUser.id'
      )
      .select([
        'job.job_name as jobName',
        'job.id as jobId',
        'job.jobRefId as jobRefId',
        'job.userId as userId',
        'job.paymentType as paymentType',
        'job.paymentMethod as paymentMethod',
        'job.last4 as last4',
        'job.stripeChargeId as stripeChargeId',
        'jobGuards.userId as paidTo',
        'jobGuards.totalJobAmount as totalJobAmount',
        'jobGuards.id as jobGuardId',
        'jobGuards.teamId as teamId',
        'stripeAccountUser.stripeAccountId as stripeAccountId',
        'userProfile.firstName as firstName',
        'userProfile.lastName as lastName',
        'jobUser.email as email',
      ])
      .where('jobGuards.jobCompletedDate IS NOT NULL')
      .andWhere(
        'DATE_ADD(jobGuards.jobCompletedDate, INTERVAL 48 HOUR) < :currentDate',
        {
          currentDate,
        }
      )
      .andWhere('jobGuards.transferStatus = 0')
      .andWhere('jobGuards.jobStatus = 3')
      .andWhere('jobGuards.teamId IS NOT NULL')
      .addSelect('jobGuards.jobId')
      .addSelect('jobGuards.teamId')
      .groupBy('jobGuards.jobId, jobGuards.teamId')
      .take(value)
      .getRawMany();
  }

  async updateJobGuardsTransferStatus(
    jobGuardId: string,
    type: string
  ): Promise<any> {
    const repo = await this.database.getRepository(JobGuards);
    if (type == 'team') {
      const teamId = await repo.findOne({ where: { id: jobGuardId } });
      return await repo
        .createQueryBuilder()
        .update(JobGuards)
        .set({ jobId: teamId.jobId })
        .where({ teamId: teamId.teamId })
        .execute();
    }
    return await repo.update({ id: jobGuardId }, { transferStatus: 1 });
  }

  async getPriceJobGuardsTransferPrice(jobGuardId: string): Promise<any> {
    const repo = await this.database.getRepository(JobGuards);
    const jobGuardsSum = await repo
      .createQueryBuilder('jobGuards')
      .select('SUM(jobGuards.totalJobAmount)', 'totalAmount')
      .where('jobGuards.jobId = :jobId', { jobId: jobGuardId })
      .andWhere('jobGuards.jobStatus=:jobStatus', { jobStatus: 1 })
      .andWhere('jobGuards.jobStatus=:jobStatus', { jobStatus: 3 })
      .andWhere('jobGuards.transferStatus = 0')
      .getRawOne();
    return jobGuardsSum;
  }
  async getTeamLeadId(jobGuardTeamId: string): Promise<any> {
    const TeamMembersrepo = await this.database.getRepository(TeamMembers);
    const userStripeAccountRepo = await this.database.getRepository(
      UserStripeDetails
    );
    const userId = await TeamMembersrepo.findOne({
      where: { teamId: jobGuardTeamId, isLead: true },
    });
    const stripeAccountId = await userStripeAccountRepo.findOne({
      where: { userId: userId.userId },
    });
    return stripeAccountId;
  }
}
