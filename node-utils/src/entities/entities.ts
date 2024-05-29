import { DataSourceOptions } from 'typeorm';
import { User } from './User';
import { UserProfile } from './UserProfile';
import { State } from './State';
import { City } from './City';
import { UserAvailabilityDate } from './UserAvailabilityTime';
import { UserAvailabilityDay } from './UserAvailabilityDay';
import { JobInterest } from './JobInterest';
import { GuardJobInterest } from './GuardJobInterest';
import { Company } from './Company';
import { Team } from './Team';
import { TeamMembers } from './TeamMembers';
import { Job } from './Job';
import { checkList } from './CheckList';
import { Settings } from './Settings';
import { JobGuards } from './JobGuards';
import { Notification } from './Notification';
import { JobGuardCoordinates } from './GuardCoordinates';
import { JobDay } from './JobDays';
import { Configurations } from './Configurations';
import { UserStripeDetails } from './UserStripeDetails';
import { UserStripeAccounts } from './UserStripeAccounts';
import { Payments } from './Payments';
import { GuardRatings } from './ratings';
import { GuardReviews } from './reviews';
import { Chats } from './Chats';
import { ChatParticipants } from './ChatParticipants';
import { ChatMessages } from './ChatMessages';
import { ChatMessageRecipients } from './ChatMessageRecipients';
import { SocketConnections } from './SocketConnections';
import { FavoriteGuard } from './GuardFavourites';
import { CrimeIndexFee } from './CrimeIndexFee';
import { JobEventTypes } from './JobEventTypes';
import { completedCheckList } from './CompletedCheckList';

export const getEntities = (): DataSourceOptions['entities'] => {
  return [
    User,
    UserProfile,
    State,
    City,
    UserAvailabilityDate,
    UserAvailabilityDay,
    JobInterest,
    GuardJobInterest,
    Company,
    Team,
    TeamMembers,
    Job,
    checkList,
    Settings,
    JobGuards,
    Notification,
    JobGuardCoordinates,
    JobDay,
    Configurations,
    UserStripeDetails,
    UserStripeAccounts,
    Payments,
    GuardReviews,
    GuardRatings,
    Chats,
    ChatParticipants,
    ChatMessages,
    ChatMessageRecipients,
    SocketConnections,
    FavoriteGuard,
    CrimeIndexFee,
    JobEventTypes,
    completedCheckList
  ];
};
