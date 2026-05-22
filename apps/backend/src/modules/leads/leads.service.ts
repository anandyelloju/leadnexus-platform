import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { VerificationService } from './verification.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  async createLead(createLeadDto: CreateLeadDto) {
    const existingLead = await this.prisma.lead.findUnique({
      where: {
        phone: createLeadDto.phone,
      },
    });

    if (existingLead) {
      if (
        this.normalizeName(existingLead.name) ===
        this.normalizeName(createLeadDto.name)
      ) {
        return existingLead;
      }

      throw new BadRequestException('Lead with this phone already exists');
    }

    try {
      return await this.prisma.lead.create({
        data: createLeadDto,
      });
    } catch (error: any) {
      console.error('Lead creation error:', error);

      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target;
        const field = Array.isArray(target)
          ? target[0]
          : typeof target === 'string'
            ? target
            : 'field';

        throw new BadRequestException(`Lead with this ${field} already exists`);
      }

      if (error.code === 'P2014' || error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference in the data provided');
      }

      throw error;
    }
  }

  async updateLead(id: string, updateLeadDto: UpdateLeadDto) {
    try {
      return await this.prisma.lead.update({
        where: { id },
        data: updateLeadDto,
      });
    } catch (error: any) {
      console.error('Lead update error:', error);

      if (error.code === 'P2025') {
        throw new NotFoundException('Lead not found');
      }

      throw error;
    }
  }

  async getAllLeads() {
    return this.prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLeadById(id: string) {
    const leadExists = await this.prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!leadExists) {
      throw new NotFoundException('Lead not found');
    }

    await this.verificationService.ensureChecklist(id);

    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        scores: true,
        actions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        verificationItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        underwritingNotes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lead!.assignedTo) {
      return {
        ...lead!,
        advisor: null,
      };
    }

    const advisor = await this.prisma.salesAgent.findUnique({
      where: {
        id: lead!.assignedTo,
      },
      select: {
        id: true,
        name: true,
        language: true,
        region: true,
      },
    });

    return {
      ...lead!,
      advisor,
    };
  }

  async findLeadByPhone(phone: string) {
    return this.prisma.lead.findUnique({
      where: {
        phone,
      },
    });
  }

  private normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
  }
}
