import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly mainBackendUrl = 'http://127.0.0.1:1310';

  getHello(): string {
    return '🚀 FlashFood Fake Backend Service is running';
  }

  async insertAdminChartDirectly(chartData: any) {
    try {
      // First, try to delete any existing record for the same period
      const deleteResponse = await axios
        .delete(`${this.mainBackendUrl}/admin-chart/delete-period`, {
          data: {
            period_start: chartData.period_start,
            period_end: chartData.period_end,
            period_type: chartData.period_type
          },
          timeout: 5000
        })
        .catch(() => null); // Ignore errors if delete endpoint doesn't exist

      // Insert the new chart data directly
      const response = await axios.post(
        `${this.mainBackendUrl}/admin-chart/direct-insert`,
        chartData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      return {
        success: true,
        message: 'Admin chart data inserted directly into database',
        data: response.data,
        recordId: chartData.id
      };
    } catch (error) {
      console.error(
        'Error inserting admin chart data directly:',
        error.message
      );

      // If direct insert fails, try the regular update endpoint as fallback
      try {
        const fallbackResponse = await axios.post(
          `${this.mainBackendUrl}/admin-chart/update`,
          {
            startDate: chartData.period_start,
            endDate: chartData.period_end,
            periodType: chartData.period_type
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          }
        );

        return {
          success: true,
          message: 'Admin chart data generated via fallback endpoint',
          data: fallbackResponse.data,
          method: 'fallback'
        };
      } catch (fallbackError) {
        return {
          success: false,
          message: 'Failed to insert admin chart data',
          error: error.message,
          fallbackError: fallbackError.message
        };
      }
    }
  }
}
