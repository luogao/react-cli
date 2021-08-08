import { DashboardContainer } from 'containers';
import { isEqual } from 'lodash';
import React from 'react';
import { useLocation } from 'react-router-dom';

import css from './style.module.less';
type Props = {};

const Index: React.FC<Props> = (props) => {
  const location = useLocation();
  const isProjectPage = !!location.pathname.split('/').find((path) => path === 'project');
  if (isProjectPage) {
    return <>{props.children}</>;
  }
  return (
    <div className={css.appLayout}>
      <DashboardContainer />
      {props.children}
    </div>
  );
};

export default React.memo(Index, isEqual);
