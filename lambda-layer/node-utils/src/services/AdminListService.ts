import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IListService } from '../interfaces/services/IAdminListService';
import { IListRepository } from '../interfaces/repo/IAdminListRepository';

@injectable()
export class ListService implements IListService {
  constructor(
    @inject(TYPES.IListRepository)
    private readonly ListRepository: IListRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) { }

  async getGuardList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    platform: any
  ): Promise<any> {
    return await this.ListRepository.getGuardList(
      searchKeyword,
      page,
      pageSize,
      platform
    );
  }

  async getGuardTeamList(
    searchKeyword: string,
    teamId: string,
    page: number,
    pageSize: number,
    guardInterestId: any,
    platform: any
  ): Promise<any> {
    return await this.ListRepository.getGuardTeamList(
      searchKeyword,
      teamId,
      page,
      pageSize,
      guardInterestId,
      platform
    );
  }
  async getAllList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    platform: any
  ): Promise<any> {
    return await this.ListRepository.getAllList(searchKeyword, page, pageSize, platform);
  }
  async getGuardsList(
    searchKeyword: string,
    page: number,
    pageSize: number,
    type: string,
    guardInterestId: any,
    platform: any
  ): Promise<any> {
    return await this.ListRepository.getGuardsList(
      searchKeyword,
      page,
      pageSize,
      type,
      guardInterestId,
      platform
    );
  }
  async getTransactionList(page: number, pageSize: number): Promise<any> {
    const jobInterest: any = await this.ListRepository.getTransactionList(
      page,
      pageSize
    );

    // Use the type annotation for the reduce function
    return jobInterest;
  }
  async getUserDetailsById(id: any, type: any, page: any, pageSize: any, jobId: any, event: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const jobInterest: any = await this.ListRepository.getUserDetailsById(
      id,
      type, page, pageSize, jobId, user
    );

    // Use the type annotation for the reduce function
    return jobInterest;
  }
  async getJobList(
    searchKeyword: string,
    page: number,
    pageSize: number
  ): Promise<any> {
    return await this.ListRepository.getJobList(searchKeyword, page, pageSize);
  }

  async getDashboard(type: string): Promise<any> {
    return await this.ListRepository.getDashboard(type);
  }
  async getRatingsReview(page: number, pageSize: number): Promise<any> {
    return await this.ListRepository.getRatingsReview(page, pageSize);
  }
}
