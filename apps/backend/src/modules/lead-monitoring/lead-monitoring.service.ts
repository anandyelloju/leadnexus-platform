import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LeadMonitoringService implements OnModuleInit {
    private readonly logger = new Logger(
        LeadMonitoringService.name,
    );

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        this.logger.log('Lead monitoring scheduler initialized. Running initial inactivity check.');
        await this.evaluateInactiveLeads();
    }

    /*
     -------------------------------------
     RUN EVERY 6 HOURS
     -------------------------------------
    */

    //  @Cron('*/30 * * * * *')
    @Cron('0 0 * * *')
    async evaluateInactiveLeads() {
        this.logger.log(
            'Running inactivity evaluation...',
        );

        const leads =
            await this.prisma.lead.findMany({
                include: {
                    events: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                    },
                    scores: true,
                },
            });

        const now = new Date();

        for (const lead of leads) {
            const latestEvent =
                lead.events?.[0];

            if (!latestEvent || !lead.scores) {
                continue;
            }

            const hoursSinceLastActivity =
                (now.getTime() -
                    new Date(latestEvent.createdAt).getTime()) /
                (1000 * 60 * 60);

            /*
             -------------------------------------
             INACTIVITY RULE
             -------------------------------------
            */

            if (hoursSinceLastActivity > 24) {
                const updatedEngagement =
                    Math.max(
                        0,
                        lead.scores.engagementScore -
                        10,
                    );

                const updatedRisk =
                    lead.scores.riskScore - 5;

                const updatedFinalScore =
                    lead.scores.intentScore +
                    lead.scores.eligibilityScore +
                    updatedEngagement +
                    updatedRisk;

                await this.prisma.leadEvent.create({
                    data: {
                        leadId: lead.id,
                        eventType: 'LEAD_INACTIVE',
                    },
                });
                
                await this.prisma.leadScore.update({
                    where: {
                        leadId: lead.id,
                    },
                    data: {
                        engagementScore:
                            updatedEngagement,
                        riskScore: updatedRisk,
                        finalScore:
                            updatedFinalScore < 0
                                ? 0
                                : updatedFinalScore,
                    },
                });

                this.logger.log(
                    `Lead ${lead.id} marked inactive`,
                );
            }
        }
    }
}