import { SaveTeamMembersRequest, favoriteGuardRequest } from '../../dto/GuardTeamDTO';
import { TeamMembers } from '../../entities/TeamMembers';
import { User } from '../../entities/User';

export interface IGuardTeamRepository {
  getAllGuards(searchKeyword: string, user: any): Promise<User[]>;
  saveTeamMembers(
    user: any,
    saveTeamMembersRequest: SaveTeamMembersRequest
  ): Promise<TeamMembers>;
  ChooseGuardList(jobId: any, type: any, event: any, teamId: any, page: any, pageSize: any, searchKeyword: any): Promise<any>;
  postFavoriteGuard(event: any,
    favoriteGuardRequest: favoriteGuardRequest): Promise<any>
  unFavoriteGuard(event: any,
    favoriteGuardRequest: favoriteGuardRequest): Promise<any>
  getFavoriteGuard(event: any, page: any, pageSize: any): Promise<any>
}
