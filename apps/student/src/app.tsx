import type {PropsWithChildren} from 'react';
import {StudentSessionProvider} from './session';
import './app.scss';
export default function App({children}:PropsWithChildren){return <StudentSessionProvider>{children}</StudentSessionProvider>;}
