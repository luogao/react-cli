import React, { useState, useEffect, useMemo, useContext } from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { v4 as uuid } from 'uuid';

import { Routes } from 'router';
import { useNotification } from '@hooks';
import { DropdownProject } from '@components';
import { SettingsContext } from '@context';
import DashboardIcon from '@icons/dashboard-project.svg';
import ActiveIcon from '@icons/dashboard-tasks.svg';
import StatsIcon from '@icons/dashboard-config.svg';

import useDashboardContainer, { MenuItems } from './dashboardContainer.hook';

import css from './style.module.less';
import { store } from 'store';

const TOOLTIP_ID = uuid();

export type Project = {
  id: string;
  manager: string;
  openDate: number;
  favorite: boolean;
  preset: string;
  name: string;
  path: string[];
  type: string;
};

export default function Dashboard() {
  const { t } = useTranslation('dashboard');
  const { locale, activeTab } = useDashboardContainer();
  const notification = useNotification();
  const { socket, selectedPath, changeSelectedPath } = useContext(SettingsContext);

  const [projects, setProjects] = useState<Project[]>([]);
  const [filterProjects, setFilterProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    socket.send({
      type: 'GET_CONFIG',
    });

    socket.send({
      type: 'GET_PROJECTS',
    });

    socket.on('config', (res: any) => {
      console.log({ config: res });

      setActive(res.data?.lastOpenProject || null);
    });

    socket.on('projects', (res: any) => {
      setProjects(res.data);
    });

    socket.on('erro', (error = { title: '未知错误', message: '请打开控制台查看' }) => {
      console.log({ error });
      notification.error({
        title: error.title || '',
        message: error.message || '',
      });
    });

    return () => {
      socket.off('config');
      socket.off('projects');
      socket.off('erro');
    };
  }, []);

  useEffect(() => {
    if (active) {
      console.log({ projects });
      console.log({ active });

      const currentProject: any = !!projects.length && projects.find((p) => p.id === active);
      console.log({ currentProject });

      const filterFavorite = (project: Project) => project.favorite === true;
      const filterName = (project: Project) => project.name !== currentProject.name;
      const filterProjects = projects.length
        ? [...projects].filter(filterName).filter(filterFavorite)
        : [];
      batch(() => {
        setTitle(currentProject ? currentProject.name : '');
        setFilterProjects(filterProjects);
        store.dispatch.workspace.setState({ currentProject });
      });
    }
  }, [active, projects]);

  const menu: MenuItems[] = [
    { key: Routes.DASHBOARD, label: t('dashboard'), Icon: DashboardIcon },
    { key: Routes.DEPENDENCIES, label: t('dependencies'), Icon: StatsIcon },
    { key: Routes.DASHBOARD_TASKS, label: t('tasks'), Icon: ActiveIcon },
    { key: Routes.ASSET_MANAGEMENT, label: '资源文件管理', Icon: ActiveIcon },
  ];

  function handleOpen(id: string, path: string[]) {
    if (id) {
      socket.send({
        type: 'OPEN_PROJECT',
        id,
      });
      changeSelectedPath(path);
      setActive(id);
    }
  }

  function handleOpenEdit() {
    socket.send({
      type: 'OPEN_EDIT_FILE',
      path: selectedPath,
    });
  }

  const renderChildren = useMemo(
    () =>
      menu.map(({ key, label, Icon }: MenuItems) => {
        return (
          <NavLink
            key={key}
            to={key}
            exact={false}
            activeClassName={css.active}
            data-tip={`<div class="${css.tooltip}">${label}</div>`}
            data-for={TOOLTIP_ID}
          >
            <Icon />
            <span className={css.disableTitle}>{label}</span>
          </NavLink>
        );
      }),
    [activeTab, locale],
  );

  return (
    <div className={css.wrapperHeader}>
      <div className={css.wrapperLayout}>
        <DropdownProject
          title={title}
          data={filterProjects}
          openEdit={handleOpenEdit}
          edit={handleOpen}
        />
        <div className={css.nav}>{renderChildren}</div>
      </div>
      <ReactTooltip
        id={TOOLTIP_ID}
        place="right"
        effect="solid"
        delayShow={300}
        offset={{ left: 30 }}
        html
      />
    </div>
  );
}
