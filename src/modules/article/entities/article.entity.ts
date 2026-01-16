import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  articleName!: string;

  @Column({ type: 'varchar' })
  articleDescription!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  articlePrice!: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @Column()
  createdById: number;

  @Column()
  updatedById: number;
}
