import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../common';
import {
  CreateCompanyDto,
  ListCompaniesQueryDto,
  UpdateCompanyDto,
} from '../dto';
import { CompanyService } from '../service';

@ApiTags('companies')
@ApiSecurity('basicAuth')
@ApiBasicAuth('basicAuth')
@UseGuards(BasicAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a company' })
  @ApiCreatedResponse({ description: 'Company created' })
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.companyService.createCompany(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List companies' })
  @ApiOkResponse({ description: 'Paginated company list' })
  listCompanies(@Query() query: ListCompaniesQueryDto) {
    return this.companyService.listCompanies(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiOkResponse({ description: 'Company details' })
  getCompany(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiOkResponse({ description: 'Updated company' })
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.updateCompany(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiOkResponse({ description: 'Company deleted' })
  deleteCompany(@Param('id') id: string) {
    return this.companyService.deleteCompany(id);
  }
}
