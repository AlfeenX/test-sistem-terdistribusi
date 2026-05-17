import Dashboard from './pages/Dashboard.svelte';
import UserList from './pages/users/UserList.svelte';
import UserMemberships from './pages/users/UserMemberships.svelte';
import FieldList from './pages/fields/FieldList.svelte';
import Slots from './pages/fields/Slots.svelte';
import Monitoring from './pages/monitoring/Monitoring.svelte';

export const routes = {
    '/': Dashboard,
    '/users': UserList,
    '/users/memberships': UserMemberships,
    '/fields': FieldList,
    '/fields/slots': Slots,
    '/monitoring': Monitoring,
};

