import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useRouteMatch } from 'react-router-dom';
import cn from 'classnames';
import { SettingsContext } from '@context';
import { DashboardWrap } from '@components';
import ProjectIcon from '@icons/nav-projects.svg';

import useTaskContainer, { TabItem } from './taskContainer.hook';
import css from './style.module.less';
import ReactTooltip from 'react-tooltip';

import { v4 as uuid } from 'uuid';

const tooltipId = uuid();
export default function TaskContainer() {
  const match = useRouteMatch<{ taskName?: string }>();
  const currentTaskName = match.params.taskName;
  console.log({ currentTaskName, match });
  const { t } = useTranslation('dashboard');
  const { locale, activeTab } = useTaskContainer();
  const { socket, darkTheme } = useContext(SettingsContext);

  // State
  const [tasks, setTask] = useState<any[]>([]);
  const styles = cn(css.wrapper, {
    [css.dark]: darkTheme,
  });

  useEffect(() => {
    socket.send({
      type: 'GET_LIST_TASKS',
    });

    socket.on('tasks', (res: any) => {
      const data = Object.entries(res.data);
      const list = [];
      for (const [key, value] of data) {
        list.push({ name: key, label: value, key, Icon: ProjectIcon });
      }
      setTask(list);
    });

    return () => {
      socket.off('tasks');
    };
  }, []);

  const renderTaskItemList = useMemo(
    () => (
      <div className={css.taskListWrapper}>
        {tasks.map(({ key, label, name }: TabItem) => {
          return (
            <div data-tip={label} key={key} data-for={tooltipId}>
              <NavLink exact={true} to={`/tasks/${key}`} activeClassName={css.active}>
                <div className={css.taskElement}>
                  <span className={css.name}>{name}</span>
                  <span className={css.value}> {label}</span>
                </div>
              </NavLink>
            </div>
          );
        })}
      </div>
    ),
    [activeTab, locale, tasks],
  );

  function renderTask() {
    return (
      <div className={styles}>
        {renderTaskItemList}
        {renderTaskContent()}
      </div>
    );
  }

  function renderTaskContent() {
    return <div className={css.taskContentWrapper}>{currentTaskName}</div>;
  }

  return (
    <>
      <DashboardWrap title={t('titleTasks')} cssStyle={{ flex: 1 }} fullContent>
        {renderTask()}
      </DashboardWrap>
      <ReactTooltip
        id={tooltipId}
        place="right"
        effect="solid"
        delayShow={300}
        offset={{ left: 30 }}
      />
    </>
  );
}
