import {useContext} from "react";
import {AuthContext, AuthState} from "./AuthProvider";
import {Redirect, Route} from "react-router-dom";

export interface ProtectedRouteProps {
    component: any,
    path: string,
    exact?: boolean,
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({component: Component, ...rest}) => {
    const {isAuthenticated} = useContext<AuthState>(AuthContext)
    return(
        <Route path={rest.path} exact={rest.exact === undefined ? false : rest.exact} render={props => {
            if(isAuthenticated){
                return <Component {...props}/>
            }
            return <Redirect to={{ pathname: '/login' }}/>
        }}>
        </Route>
    )
}

export default ProtectedRoute;