import React, { useState, useEffect, useContext, useMemo, useRef, FC, useCallback } from 'react';
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
  const match = useRouteMatch<{ taskId?: string }>();
  const currentTaskId = match.params.taskId;
  const { t } = useTranslation('dashboard');
  const { locale, activeTab } = useTaskContainer();
  const { socket, darkTheme, currentRunningTasks } = useContext(SettingsContext);
  const taskTerminal = useRef<typeof TaskTerminal>();
  const [tasks, setTask] = useState<TaskItem[]>([]);
  const taskDetail = tasks.find((t) => t.id === currentTaskId);
  const currentRunningTask = currentRunningTasks.find((t) => t.id === taskDetail?.id);

  // State
  const styles = cn(css.wrapper, {
    [css.dark]: darkTheme,
  });

  const handleCurrentTaskMessageRecover = useCallback(
    (msg: { type: string; text: string; id: string }[], taskId: string) => {
      if (taskId === currentTaskId) {
        console.log({ msg });
        msg.forEach((m) => {
          setTerminalLog(m);
        });
      } else {
        clearTerminalLog();
      }
    },
    [currentTaskId],
  );

  useEffect(() => {
    socket.send({
      type: 'GET_LIST_TASKS',
    });

    socket.on('taskStartSuccess', (res: any) => {
      console.log({ taskStartSuccess: res });
    });

    socket.on(
      'currentTaskMessageRecover',
      ({
        data: { msg, taskId },
      }: {
        data: { msg: { type: string; text: string; id: string }[]; taskId: string };
      }) => {
        handleCurrentTaskMessageRecover(msg, taskId);
      },
    );

    socket.on('tasks', (res: any) => {
      console.log({ res });
      const list = res.data;
      setTask(list);
    });

    socket.on('taskLogAdd', ({ data }: { data: any }) => {
      setTerminalLog(data);
    });

    return () => {
      socket.off('tasks');
      socket.off('currentTaskMessageRecover');
    };
  }, [handleCurrentTaskMessageRecover]);

  useEffect(() => {
    if (currentTaskId && currentRunningTask && currentRunningTask.id === currentTaskId) {
      console.log({ currentTaskId });
      socket.send({ type: 'recoverTaskMessage', taskId: currentTaskId });
    } else {
      clearTerminalLog();
    }
  }, [currentTaskId, currentRunningTask]);

  const setTerminalLog = (msg: any) => {
    taskTerminal.current && taskTerminal.current.addLog(msg);
  };

  const clearTerminalLog = () => {
    taskTerminal.current && taskTerminal.current.clear();
  };

  const renderTaskItemList = useMemo(
    () => (
      <div className={css.taskListWrapper}>
        {tasks.map(({ id, command, name }: TaskItem) => {
          return (
            <div data-tip={command} key={id} data-for={tooltipId}>
              <NavLink exact={true} to={`/tasks/${id}`} activeClassName={css.active}>
                <div className={css.taskElement}>
                  <span className={css.name}>{name}</span>
                  <span className={css.value}>{command}</span>
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
    if (taskDetail) {
      console.log(taskDetail);
      socket.send({
        type: 'RUN_TASK',
        id: taskDetail.id,
        name: taskDetail?.name,
      });
    }
  }
  function stopTask() {
    if (taskDetail && currentRunningTask) {
      console.log(currentRunningTask);
      socket.send({
        type: 'STOP_TASK',
        id: taskDetail.id,
        name: taskDetail.name,
        runningTaskPid: currentRunningTask.pid,
      });
    }
  }

  function renderTaskControl() {
    if (!currentRunningTask) {
      return (
        <div className={css.taskControlWrapper}>
          <button onClick={handleRunTask}>运行</button>
        </div>
      );
    } else {
      return (
        <div className={css.taskControlWrapper}>
          <button onClick={stopTask}>停止</button>
        </div>
      );
    }
  }

  function renderTaskContent() {
    if (!taskDetail?.name) return null;
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
