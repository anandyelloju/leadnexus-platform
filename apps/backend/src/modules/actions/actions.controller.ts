import { Controller, Get } from '@nestjs/common';
import { Param, Patch } from '@nestjs/common';

import { ActionsService } from './actions.service';

@Controller('actions')
export class ActionsController {
  constructor(
    private readonly actionsService: ActionsService,
  ) { }

  @Get()
  async getAllActions() {
    return this.actionsService.getAllActions();
  }

  @Get('pending')
  async getPendingActions() {
    return this.actionsService.getPendingActions();
  }

  @Patch(':id/complete')
  async completeAction(
    @Param('id') id: string,
  ) {
    return this.actionsService.completeAction(id);
  }
}