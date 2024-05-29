import { MigrationInterface, QueryRunner } from "typeorm";

export class changejobVenueRadiustonull1702287110473 implements MigrationInterface {
    name = 'changejobVenueRadiustonull1702287110473'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`job\` CHANGE \`job_venue_radius\` \`job_venue_radius\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job\` CHANGE \`job_venue_radius\` \`job_venue_radius\` varchar(255) NOT NULL`);
    }

}
