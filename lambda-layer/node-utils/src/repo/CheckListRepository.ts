import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IDatabaseService } from "../interfaces/services/IDatabaseService";
import moment from "moment"
import { ICheckListRepository } from "../interfaces/repo/ICheckListRepository";
import { ApproveCheckListRequest } from "../dto/CheckList";
import { checkList } from "../entities/CheckList";
import { INotificationRepository } from "../interfaces/repo/INotificationRepository";
import { UserProfile } from "../entities/UserProfile";
import { Job } from "../entities/Job";
import { GlobalConstants } from "../constants/constants";
import { completedCheckList } from "../entities/CompletedCheckList";
@injectable()
export class CheckListRepository implements ICheckListRepository {
    constructor(
        @inject(TYPES.IDatabaseService) private readonly database: IDatabaseService,
        @inject(TYPES.INotificationRepository)
        private readonly NotificationRepository: INotificationRepository,
        @inject(TYPES.IPushService)
        private readonly pushService: IPushService,
        private readonly globalConstants = GlobalConstants
    ) { }
    async approveCheckList(
        ApproveCheckListPayload: ApproveCheckListRequest,
        user: any
    ): Promise<any> {
        const repo = await this.database.getRepository(checkList);
        const completeCheckListRepo = await this.database.getRepository(completedCheckList);
        const userRepo = await this.database.getRepository(UserProfile);
        const jobRepo = await this.database.getRepository(Job);
        const userId = user.id
        console.log(ApproveCheckListPayload.checkListId, "ApproveCheckListPayload.checkListId ");

        const existingCheckList: any = await repo.findOne({
            where: { id: ApproveCheckListPayload.checkListId }
        });
        const isCheckListCompletedByUser = await completeCheckListRepo.findOne({
            where: { checkListId: ApproveCheckListPayload.checkListId, userId: userId, }
        });
        const currentDate = new Date();
        if (!existingCheckList) {
            return ({ "data": "", "message": "Please Enter Proper CheckListId." });
        }
        if (isCheckListCompletedByUser) {
            return ({ "data": "", "message": "CheckList is already verified." });
        }
        if (ApproveCheckListPayload.status == 1) {
            await repo.update({ id: ApproveCheckListPayload.checkListId }, {
                isCheckListCompleted: ApproveCheckListPayload.status
            })

            await completeCheckListRepo.insert({
                userId: userId,
                checkListId: ApproveCheckListPayload.checkListId,
                createdOn: new Date(),
                updatedOn: new Date(),
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                createdBy: this.globalConstants.SYS_ADMIN_GUID,
            })
            const CheckList: any = await repo.findOne({
                where: { id: ApproveCheckListPayload.checkListId }
            });
            return CheckList
        }
        // if (moment(existingCheckList.time).utc().toDate() < moment(currentDate).utc().toDate() && ApproveCheckListPayload.status == 2) {
        // if (ApproveCheckListPayload.status == 2) {
        const dateStr = existingCheckList.date;
        const timeStr = existingCheckList.time;
        const date = new Date(dateStr);
        // Get the time string
        const hours = timeStr.getHours().toString().padStart(2, '0'); // Get hours (in 24-hour format) and pad with leading zero if necessary
        const minutes = timeStr.getMinutes().toString().padStart(2, '0'); // Get minutes and pad with leading zero if necessary
        const seconds = timeStr.getSeconds().toString().padStart(2, '0');
        date.setUTCHours(hours, minutes, seconds);
        const formattedDateTime = date.toISOString();
        const existingCheckListTime = moment(formattedDateTime, 'YYYY-MM-DD HH:mm:ss');
        if (existingCheckListTime.isBefore(moment(currentDate)) && ApproveCheckListPayload.status == 2) {
            await repo.update({ id: ApproveCheckListPayload.checkListId }, {
                isCheckListCompleted: ApproveCheckListPayload.status
            })
            await completeCheckListRepo.insert({
                userId: userId,
                checkListId: ApproveCheckListPayload.checkListId,
                createdOn: new Date(),
                updatedOn: new Date(),
                updatedBy: this.globalConstants.SYS_ADMIN_GUID,
                createdBy: this.globalConstants.SYS_ADMIN_GUID,
            })
            const CheckList: any = await repo.findOne({
                where: { id: ApproveCheckListPayload.checkListId }
            });
            const userName = await userRepo.findOne({ where: { userId: userId } })
            const name = userName.firstName + " " + userName.lastName
            const jobName = await jobRepo.findOne({ where: { id: existingCheckList.jobId } })
            await this.sendJobStatusNotification(name, jobName)
            return CheckList
        }
        else {
            return ({ data: "", message: "Please Approve Once After checkList Time." });
        }

    }
    private async sendJobStatusNotification(
        name: any,
        jobName: any
    ) {
        let pushStatus = 'Task Completed!!';
        let message = `${name} has completed task for the job #${jobName.jobRefId} as instructed`
        const id = jobName.id
        let notificationDetails =
            await this.NotificationRepository.saveNotification(
                jobName.userId,
                'PUSH',
                `FIDO - ${pushStatus}`,
                message,
                'JOB_DETAIL',
                jobName.id
            );
        let returnMsg = await this.pushService.sendPush(
            `FIDO - ${pushStatus}`,
            message,
            [jobName.userId],
            { id },
            notificationDetails
        );
        await this.NotificationRepository.updateNotificationStatus(
            notificationDetails.id,
            returnMsg
        );
    }
}
