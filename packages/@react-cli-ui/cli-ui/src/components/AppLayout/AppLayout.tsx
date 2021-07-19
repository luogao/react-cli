import { DashboardContainer } from 'containers';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import css from './style.module.less';
type Props = {};

const index: React.FC<Props> = (props) => {
  const location = useLocation();
  const isProjectPage = !!location.pathname.split('/').find((path) => path === 'project');
  console.log({ isProjectPage });
  if (isProjectPage) {
    return props.children;
  }
  return (
    <div className={css.appLayout}>
      <DashboardContainer />
      {props.children}
    </div>
  );
};

export default index;
