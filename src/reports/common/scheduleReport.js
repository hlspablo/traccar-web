import { apiPost } from '../../common/util/api';

const scheduleReport = async (deviceIds, groupIds, report) => {
  try {
    const newReport = await apiPost('/reports', report);

    if (deviceIds.length) {
      await apiPost(
        '/permissions/bulk',
        deviceIds.map((id) => ({ deviceId: id, reportId: newReport.id })),
      );
    }

    if (groupIds.length) {
      await apiPost(
        '/permissions/bulk',
        groupIds.map((id) => ({ groupId: id, reportId: newReport.id })),
      );
    }

    return null;
  } catch (error) {
    return error.message;
  }
};

export default scheduleReport;
