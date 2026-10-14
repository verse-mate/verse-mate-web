import AdminHomeScreen from '@/prototype/noticket-20/AdminHome';
import { JoinRequests } from '@/prototype/noticket-20/admin';

export default function State() {
  return <AdminHomeScreen requests={<JoinRequests dialog="approve" refusal="address-changed" />} />;
}
