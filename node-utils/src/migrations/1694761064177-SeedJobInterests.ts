import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedJobInterests1694761064177 implements MigrationInterface {
  name = 'SeedJobInterests1694761064177';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO job_interest (id, interest_name, interest_type, status, created_by, created_on, updated_by, updated_on, description, display_order)
      VALUES
      ('2b96b4ea-3f3b-4969-b43d-4a0e0a6d1e91','Short Term',1,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:40:42',NULL,NULL,'Upto 3 months',2),
      ('8e0ca92d-3da6-4fc1-b1d1-61b7a06e4a5d','Single Event',1,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:40:04',NULL,NULL,'',1),
      ('cb19b6c5-4f2a-41a5-8c8d-9b8f5dfaf89d','Long Term',1,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:41:11',NULL,NULL,'Ongoing, Indefinite',3),
      ('5d9bf6f8-6b4e-41a5-89a1-58c8b4505c8e','Formal military',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:55:57',NULL,NULL,'',3),
      ('ad7e64c3-5023-4e7e-bd0f-193edb1c6a44','Armed',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:55:39',NULL,NULL,'',1),
      ('3087b8cf-8900-46af-9b0d-980a3b20dbb9','Unarmed',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:55:49',NULL,NULL,'',2),
      ('eb86568c-17d0-42bf-9b63-84907b3e789d','Uniformed',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:04',NULL,NULL,'',4),
      ('94cd8c9a-0a8d-42d4-951a-34bfb4190fe3','Plainclothes',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:46',NULL,NULL,'',7),
      ('b9263a68-8103-4d9e-aa79-3d1d5f0653b2','Formal wear',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:52',NULL,NULL,'',8),
      ('c4afceef-09ad-42d0-8a1e-1be340c8d0e3','Current law enforcement',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:15',NULL,NULL,'',5),
      ('f1e8e4f5-48ab-4d7a-9471-2a03b1707514','Former law enforcement',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:32',NULL,NULL,'',6),
      ('f1e8e4f5-48ab-4d7a-9471-2a03b1765437','Licensed private security',2,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:32',NULL,NULL,'',9)
      ('1b90a1af-997a-45c6-b59b-6c7b907788a9','Executive protection',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:55:39',NULL,NULL,'',1),
      ('3d5b857b-af46-4b02-b37e-8bcf66dbb3e4','School resource officer',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:55:49',NULL,NULL,'',2),
      ('8904bade-61b7-482e-9d1e-52b44f0e8a5a','Event security',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:04',NULL,NULL,'',4),
      ('e258df4b-6489-4d52-a235-5a79e68fb4e9','Neighborhood watch',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:46',NULL,NULL,'',7),
      ('fcb4eb64-99e1-4186-bc12-2f46a863bcf1','Property set-out',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:52',NULL,NULL,'',8),
      ('70a1a28d-1f23-4a6a-bdf7-6017b7788c53','Workplace security',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:15',NULL,NULL,'',5),
      ('521f1e9b-32c6-4a26-bb78-25c00f5b3c5e','Home security',3,1,'00000000-0000-0000-0000-000000000000','2023-09-07 02:56:32',NULL,NULL,'',6),
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> { }
}
