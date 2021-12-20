import * as React from 'react';

export type Route = {

    path: string;

    component: React.ComponentType<any>;

    routes: Array<Route>;
}