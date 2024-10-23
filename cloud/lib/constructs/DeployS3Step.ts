import { IStage } from 'aws-cdk-lib/aws-codepipeline';
import { S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
	CodePipelineActionFactoryResult,
	FileSet,
	ICodePipelineActionFactory,
	ProduceActionOptions,
	Step,
} from 'aws-cdk-lib/pipelines';

type DeployS3StepProps = {
	actionName: string;
	bucketName: string;
	input: FileSet;
};
export class DeployS3Step extends Step implements ICodePipelineActionFactory {
	private readonly actionName: DeployS3StepProps['actionName'];
	private readonly bucketName: DeployS3StepProps['bucketName'];
	private readonly input: DeployS3StepProps['input'];

	constructor(id: string, props: DeployS3StepProps) {
		super(id);
		this.actionName = props.actionName;
		this.bucketName = props.bucketName;
		this.input = props.input;
	}

	public produceAction(
		stage: IStage,
		options: ProduceActionOptions
	): CodePipelineActionFactoryResult {
		stage.addAction(
			new S3DeployAction({
				actionName: this.actionName,
				bucket: Bucket.fromBucketName(options.scope, `${this.actionName}-Bucket`, this.bucketName),
				input: options.artifacts.toCodePipeline(this.input),
				runOrder: options.runOrder,
			})
		);

		return {
			runOrdersConsumed: 1,
		};
	}
}
