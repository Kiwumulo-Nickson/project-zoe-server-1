import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactsService } from '../contacts.service';
import { InjectRepository } from '@nestjs/typeorm';

import { Like, Repository } from 'typeorm';
import { ContactSearchDto } from '../dto/contact-search.dto';

import { hasValue } from 'src/utils/validation';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { CreateCompanyDto } from '../dto/create-company.dto';
import Company from '../entities/company.entity';
import CompanyListDto from '../dto/company-list.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import ContactListDto from '../dto/contact-list.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Crm Companies')
@Controller('api/crm/companies')
export class CompaniesController {
  constructor(
    private readonly service: ContactsService,
    @InjectRepository(Company)
    private readonly personRepository: Repository<Company>,
  ) {}

  @Get()
  async findAll(@Query() req: ContactSearchDto): Promise<Company[]> {
    let q: FindConditions<Company>[] = [];
    if (hasValue(req.query)) {
      q = [
        {
          name: Like(`${req.query}%`),
        },
      ];
    }
    return await this.personRepository.find({
      where: q,
      skip: req.skip,
      take: req.limit,
    });
  }

  @Get('combo')
  async findCombo(@Query() req: ContactSearchDto): Promise<CompanyListDto[]> {
    const data = await this.personRepository.find({
      select: ['id', 'name'],
      skip: req.skip,
      take: req.limit,
    });
    return data.map((it) => ({
      id: it.id,
      name: it.name,
    }));
  }

  @Post()
  async create(@Body() data: CreateCompanyDto): Promise<ContactListDto> {
    const contact = await this.service.createCompany(data);
    return ContactsService.toListDto(contact);
  }

  @Put()
  async update(@Body() data: Company): Promise<Company> {
    return await this.personRepository.save(data);
  }
}
