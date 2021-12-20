import React, { PureComponent as Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import HomeLayout from '../components/Layout/HomeLayout'
import { Index, Group, Project, Follows, AddProject, Login, Home } from '../containers/index';
import User from '../containers/User/User.js';
// import { CreateRoute } from './RouterUtil';
const routesSystem = [
    {
        path: "/home",
        exact: true,
        component: HomeLayout,
        
    }, {
        path: '/group',
        component: Group
    }, {
        path: '/project/:id',
        component: Project
    }, {
        path: '/user',
        component: User
    }, {
        path: '/follow',
        component: Follows
    }, {
        path: '/add-project',
        component: AddProject
    }, {
        path: '/login',
        component: Login
    }
]

const Routes = [
    ...routesSystem
]

function CreateRoute(route) {
    console.log(route)
    return (
        <Route
            path={route.path}
            exact
            render={props => (
                <route.component {...props} routes={route.routes} />
            )}
        />
    );
}

export default function RouterConfig() {
    return (
        <Switch>
            {
                Routes.map((route, index) => {
                    return (<CreateRoute key={index} {...route}></CreateRoute>)
                    // return (<Route
                    //     key={index + route.path}
                    //     path={route.path}
                    //     exact
                    //     // component={route.component}

                    //     render={props => (
                    //         <route.component {...props} routes={route.routes}></route.component>
                    //     )}
                    // />
                    // )
                })
            }
        </Switch>
    )

}
