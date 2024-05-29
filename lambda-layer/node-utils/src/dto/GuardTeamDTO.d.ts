import { TeamMembers } from '../entities/TeamMembers';

export interface SaveTeamMembersRequest {
  guardEmails: Array<TeamMembers>;
}

export interface favoriteGuardRequest {
  guardId: string,
  isFavorite: any,
  id: any
}
