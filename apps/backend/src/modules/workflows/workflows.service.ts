import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(
    WorkflowsService.name,
  );

  async triggerLeadWorkflow(
    leadId: string,
    currentStage: string,
  ) {
    this.logger.log(
      `Workflow triggered for Lead ${leadId} at stage ${currentStage}`,
    );

    return true;
  }
}