import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IGuardTeamRepository } from '../interfaces/repo/IGuardTeamRepository';
import { IGuardTeamService } from '../interfaces/services/IGuardTeamService';
import { User } from '../entities/User';
import { TeamMembers } from '../entities/TeamMembers';
import {
  SaveTeamMembersRequest,
  favoriteGuardRequest,
} from '../dto/GuardTeamDTO';

@injectable()
export class GuardTeamService implements IGuardTeamService {
  constructor(
    @inject(TYPES.IGuardTeamRepository)
    private readonly UserRepository: IGuardTeamRepository,
    @inject(TYPES.IAuthService)
    private readonly authService: IAuthService
  ) { }

  async getAllGuards(searchKeyword: string, event: any): Promise<User[]> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.UserRepository.getAllGuards(
      searchKeyword,
      user
    );
    return response;
  }

  async saveTeamMembers(
    event: any,
    saveTeamMembersPayload: SaveTeamMembersRequest
  ): Promise<TeamMembers> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.UserRepository.saveTeamMembers(
      user,
      saveTeamMembersPayload
    );
    return response;
  }

  async ChooseGuardList(
    jobId: any,
    type: any,
    event: any,
    teamId: any,
    page: any,
    pageSize: any,
    searchKeyword: any
  ): Promise<any> {
    // const user = await this.authService.decodeJwt(event);
    const user = ""
    const response = await this.UserRepository.ChooseGuardList(
      jobId,
      type,
      user,
      teamId,
      page,
      pageSize,
      searchKeyword
    );
    console.log('GuardsList', response);
    return response;
  }

  async postFavoriteGuard(
    event: any,
    favoriteGuardRequest: favoriteGuardRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.UserRepository.postFavoriteGuard(
      user,
      favoriteGuardRequest
    );
    return response;
  }
  async unFavoriteGuard(
    event: any,
    favoriteGuardRequest: favoriteGuardRequest
  ): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.UserRepository.unFavoriteGuard(
      user,
      favoriteGuardRequest
    );
    return response;
  }
  async getFavoriteGuard(event: any, page: any, pageSize: any): Promise<any> {
    const user = await this.authService.decodeJwt(event);
    const response = await this.UserRepository.getFavoriteGuard(user, page, pageSize);
    return response;
  }
}
