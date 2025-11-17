import type { ReactNode } from 'react';
import MainLayout from '~/components/layout/main-layout';
import DynamicHeader from './dynamic-header';

interface OrgLayoutProps {
  children: ReactNode;
  params: {
    orgId: string;
  };
}

export default function OrgLayout({ children, params }: OrgLayoutProps) {
  return <MainLayout header={<DynamicHeader />}>{children}</MainLayout>;
}
