import React, { useState, useEffect, useContext, useMemo, useRef, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useRouteMatch } from 'react-router-dom';
import cn from 'classnames';
import { SettingsContext } from '@context';
import { DashboardWrap, TaskTerminal } from '@components';
import ProjectIcon from '@icons/nav-projects.svg';

import useTaskContainer, { TabItem } from './taskContainer.hook';
import css from './style.module.less';
import ReactTooltip from 'react-tooltip';

import { v4 as uuid } from 'uuid';
import { TaskItem } from './types';

const tooltipId = uuid();

type Props = {};

const TaskContainer: FC<Props> = () => {
  const match = useRouteMatch<{ taskName?: string }>();
  const currentTaskName = match.params.taskName;
  const { t } = useTranslation('dashboard');
  const { locale, activeTab } = useTaskContainer();
  const { socket, darkTheme } = useContext(SettingsContext);
  const taskTerminal = useRef<typeof TaskTerminal>();

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
      console.log({ res });
      const list = res.data;
      setTask(list);
    });

    socket.on('taskLogAdd', ({ data }: { data: any }) => {
      console.log(data);
      taskTerminal.current && taskTerminal.current.addLog(data);
    });

    return () => {
      socket.off('tasks');
    };
  }, []);

  const renderTaskItemList = useMemo(
    () => (
      <div className={css.taskListWrapper}>
        {tasks.map(({ id, command, name }: TaskItem) => {
          return (
            <div data-tip={command} key={id} data-for={tooltipId}>
              <NavLink exact={true} to={`/tasks/${name}`} activeClassName={css.active}>
                <div className={css.taskElement}>
                  <span className={css.name}>{name}</span>
                  <span className={css.value}> {command} </span>
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

  function handleRunTask() {
    console.log({ currentTaskName });
    socket.send({
      type: 'RUN_TASK',
      name: currentTaskName,
    });
  }

  function renderTaskControl() {
    return (
      <div className={css.taskControlWrapper}>
        <button onClick={handleRunTask}>运行</button>
      </div>
    );
  }

  function renderTaskContent() {
    if (!currentTaskName) return null;
    return (
      <div className={css.taskContentWrapper}>
        {renderTaskControl()}
        <TaskTerminal ref={taskTerminal} />
      </div>
    );
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
};

export default TaskContainer;
