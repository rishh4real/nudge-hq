import { Router } from 'express';
import {
  getAllEmployeeUpdates,
  getDepartments,
  getEmployees,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  inviteEmployee,
  exportReportData,
  getWorkspaceProjects,
  createWorkspaceProject,
  updateWorkspaceProject,
  deleteWorkspaceProject,
  getIntegrationRequests,
  createIntegrationRequest,
  getFeedbackItems,
  createFeedbackItem,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticate);

// Department directory (readable by all users, writable only by admins)
router.get('/departments', getDepartments);
router.post('/departments', authorize('admin', 'hr'), validateBody(['name']), createDepartment);
router.put('/departments/:id', authorize('admin', 'hr'), updateDepartment);
router.delete('/departments/:id', authorize('admin'), deleteDepartment);

// Employee onboarding
router.get('/employees', authorize('admin', 'hr', 'manager'), getEmployees);
router.post('/employees/invite', authorize('admin', 'hr'), validateBody(['email']), inviteEmployee);

// Admin queries and logs (Admin only)
router.get('/updates', authorize('admin', 'hr', 'manager'), getAllEmployeeUpdates);
router.get('/reports/export', authorize('admin', 'hr'), exportReportData);

// Workspace operations
router.get('/projects', authorize('admin', 'hr', 'manager'), getWorkspaceProjects);
router.post('/projects', authorize('admin', 'hr', 'manager'), validateBody(['name']), createWorkspaceProject);
router.put('/projects/:id', authorize('admin', 'hr', 'manager'), updateWorkspaceProject);
router.delete('/projects/:id', authorize('admin', 'hr', 'manager'), deleteWorkspaceProject);

router.get('/integration-requests', authorize('admin', 'hr'), getIntegrationRequests);
router.post('/integration-requests', authorize('admin', 'hr'), validateBody(['title', 'details']), createIntegrationRequest);

router.get('/feedback', authorize('admin', 'hr', 'manager', 'employee'), getFeedbackItems);
router.post('/feedback', authorize('admin', 'hr', 'manager', 'employee'), validateBody(['comment']), createFeedbackItem);

export default router;
