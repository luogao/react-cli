import { AppContainer, ProjectContainer, DashboardContainer, TaskContainer } from 'containers';
import {
  Projects,
  SelectFolder,
  Dependencies,
  PageNotFound,
  Dashboard,
  CreateProject,
} from '@pages';

/** Url's основных страниц */
export enum Routes {
  MAIN = '/',
  PROJECT = '/project',
  PROJECT_SELECT = '/project/select',
  PROJECT_CREATE = '/project/create',
  PROJECT_IMPORT = '/project/import',
  DASHBOARD = '/dashboard',
  DASHBOARD_TASKS = '/tasks',
  DEPENDENCIES = '/dependencies',
  NOT_FOUND = '/404',
  ASSET_MANAGEMENT = '/asset-management',
}

export interface RouteEntity {
  Component: React.FC<React.ReactNode>;
  paths: {
    root: string;
    [key: string]: string | RouteEntity;
  };
  isRowDirection?: boolean;
  exact?: boolean;
}

type RoutesCollection = {
  [key: string]: RouteEntity;
};

export const AppRoutes: RoutesCollection = {
  main: {
    paths: {
      root: Routes.MAIN,
    },
    exact: true,
    Component: AppContainer,
  },
  projects: {
    paths: {
      root: Routes.PROJECT,
      project: {
        paths: {
          root: Routes.PROJECT,
        },
        exact: true,
        Component: Projects,
      },
      projectSelect: {
        paths: {
          root: Routes.PROJECT_SELECT,
        },
        exact: true,
        Component: SelectFolder,
      },
      projectCreate: {
        paths: {
          root: Routes.PROJECT_CREATE,
        },
        exact: true,
        Component: CreateProject,
      },
      projectImport: {
        paths: {
          root: Routes.PROJECT_IMPORT,
        },
        exact: true,
        Component: SelectFolder,
      },
    },
    exact: false,
    Component: ProjectContainer,
  },
  dashboard: {
    paths: {
      root: Routes.DASHBOARD,
    },
    isRowDirection: true,
    exact: true,
    Component: Dashboard,
  },
  dashboardStats: {
    paths: {
      root: Routes.DEPENDENCIES,
    },
    exact: true,
    isRowDirection: true,
    Component: Dependencies,
  },
  tasks: {
    paths: {
      root: `${Routes.DASHBOARD_TASKS}`,
    },
    exact: true,
    isRowDirection: true,
    Component: TaskContainer,
  },
  tasksAction: {
    paths: {
      root: `${Routes.DASHBOARD_TASKS}/:taskId`,
    },
    exact: true,
    isRowDirection: true,
    Component: TaskContainer,
  },
  notFound: {
    paths: {
      root: '*',
    },
    exact: true,
    Component: PageNotFound,
  },
};
