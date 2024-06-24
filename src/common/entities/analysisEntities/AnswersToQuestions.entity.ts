import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Analysis } from "./Analysis.entity";

@Index("answers_to_questions_pkey", ["id"], { unique: true })
@Entity("answers_to_questions", { schema: "public" })
export class AnswersToQuestions {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "answers", nullable: true, length: 100 })
  answers: string | null;

  @Column("real", {
    name: "questionnaire_score",
    nullable: true,
    precision: 24,
  })
  questionnaireScore: number | null;

  @Column("real", { name: "analysis_score", nullable: true, precision: 24 })
  analysisScore: number | null;

  @Column("real", { name: "combined_score", nullable: true, precision: 24 })
  combinedScore: number | null;

  @Column("timestamp without time zone", {
    name: "created_time",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdTime: Date | null;

  @ManyToOne(() => Analysis, (analysis) => analysis.answersToQuestions)
  @JoinColumn([{ name: "batch_id", referencedColumnName: "batchId" }])
  batch: Analysis;
}
