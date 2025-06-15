import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AdminChartService } from './admin_chart.service';
import { AdminChartQueryDto, PeriodType } from './dto/admin_chart_query.dto';
import { createResponse } from 'src/utils/createResponse';

@Controller('admin-chart')
export class AdminChartController {
  constructor(private readonly adminChartService: AdminChartService) {}

  @Get()
  async getChartData(@Query() query: AdminChartQueryDto) {
    console.log(
      `Getting admin chart data from ${query.start_date} to ${query.end_date}`
    );
    console.log(
      `Period type: ${query.period_type}, Force refresh: ${query.force_refresh}`
    );

    const startTimestamp = Math.floor(
      new Date(query.start_date).getTime() / 1000
    );
    const endTimestamp = Math.floor(new Date(query.end_date).getTime() / 1000);
    const forceRefresh = query.force_refresh === 'true';

    console.log(
      `Start timestamp: ${startTimestamp}, End timestamp: ${endTimestamp}`
    );

    return this.adminChartService.getChartData(
      startTimestamp,
      endTimestamp,
      query.period_type || PeriodType.DAILY,
      forceRefresh
    );
  }

  @Post('update')
  async updateChartData(@Query() query: AdminChartQueryDto) {
    const startTimestamp = Math.floor(
      new Date(query.start_date).getTime() / 1000
    );
    const endTimestamp = Math.floor(new Date(query.end_date).getTime() / 1000);

    await this.adminChartService.generateChartData(
      startTimestamp,
      endTimestamp,
      query.period_type || PeriodType.DAILY
    );

    return createResponse('OK', null, 'Admin chart data updated successfully');
  }

  @Post('direct-insert')
  async directInsert(@Body() chartData: any) {
    try {
      await this.adminChartService.insertFakeChartData(chartData);
      return createResponse(
        'OK',
        { recordId: chartData.id },
        'Chart data inserted directly'
      );
    } catch (error) {
      console.error('Direct insert error:', error);
      return createResponse(
        'ServerError',
        null,
        'Failed to insert chart data directly'
      );
    }
  }

  @Post('delete-period')
  async deletePeriod(
    @Body()
    data: {
      period_start: number;
      period_end: number;
      period_type: string;
    }
  ) {
    try {
      await this.adminChartService.deletePeriodData(
        data.period_start,
        data.period_end,
        data.period_type
      );
      return createResponse('OK', null, 'Period data deleted successfully');
    } catch (error) {
      console.error('Delete period error:', error);
      return createResponse(
        'ServerError',
        null,
        'Failed to delete period data'
      );
    }
  }
}
