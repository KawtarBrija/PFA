import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaKey, FaPlus, FaSearch, FaTrash, FaUserEdit, FaUsers } from 'react-icons/fa';
import api from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import ExportButtons from '../../components/common/ExportButtons';
import { formatDateTime } from '../../utils/format';

const ROLES = ['AGENT', 'SUPERVISOR', 'ADMIN'];
const EXPORT_COLUMNS = [
  { key: 'lastName', label: 'Nom' },
  { key: 'firstName', label: 'Prenom' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telephone' },
  { key: 'roleName', label: 'Role' },
  { key: 'createdAt', label: 'Date de creation' }
];
const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 250);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedQuery) params.query = debouncedQuery;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/users', { params });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, roleFilter]);

  const pagedUsers = useMemo(
    () => users.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [users, page]
  );
  const totalPages = Math.max(Math.ceil(users.length / PAGE_SIZE), 1);

  const askAndUpdateUser = async (user) => {
    const { value: values } = await Swal.fire({
      title: 'Modify user',
      width: 720,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      html: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
          <label class="text-sm text-ink">First name</label>
          <input id="firstName" class="swal2-input" value="${user.firstName || ''}" />

          <label class="text-sm text-ink">Last name</label>
          <input id="lastName" class="swal2-input" value="${user.lastName || ''}" />

          <label class="text-sm text-ink">Email</label>
          <input id="email" class="swal2-input" type="email" value="${user.email || ''}" />

          <label class="text-sm text-ink">Phone</label>
          <input id="phone" class="swal2-input" value="${user.phone || ''}" />

          <label class="text-sm text-ink">Role</label>
          <select id="roleName" class="swal2-input">
            ${ROLES.map((role) => `<option value="${role}" ${user.roleName === role ? 'selected' : ''}>${role}</option>`).join('')}
          </select>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const firstName = Swal.getPopup()?.querySelector('#firstName')?.value?.trim();
        const lastName = Swal.getPopup()?.querySelector('#lastName')?.value?.trim();
        const email = Swal.getPopup()?.querySelector('#email')?.value?.trim();
        const phone = Swal.getPopup()?.querySelector('#phone')?.value?.trim();
        const roleName = Swal.getPopup()?.querySelector('#roleName')?.value;

        if (!firstName || !lastName || !email || !roleName) {
          Swal.showValidationMessage('All required fields must be filled.');
          return false;
        }

        return { firstName, lastName, email, phone, roleName };
      }
    });

    if (!values) return;

    try {
      await api.put(`/users/${user.id}`, values);
      Swal.fire({ icon: 'success', title: 'User updated', timer: 1200, showConfirmButton: false });
      loadUsers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err?.response?.data?.message || 'Please try again.' });
    }
  };

  const askAndDeleteUser = async (user) => {
    const res = await Swal.fire({
      title: 'Delete this user?',
      text: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e11d48'
    });

    if (!res.isConfirmed) return;

    try {
      await api.delete(`/users/${user.id}`);
      Swal.fire({ icon: 'success', title: 'User deleted', timer: 1200, showConfirmButton: false });
      loadUsers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err?.response?.data?.message || 'Please try again.' });
    }
  };

  const askAndResetPassword = async (user) => {
    const { value: values } = await Swal.fire({
      title: 'Reset password',
      text: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      width: 520,
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      html: `
        <div class="grid grid-cols-1 gap-3 text-left">
          <label class="text-sm text-ink">New password</label>
          <input id="newPassword" type="password" class="swal2-input" minlength="6" />

          <label class="text-sm text-ink">Confirm password</label>
          <input id="confirmPassword" type="password" class="swal2-input" minlength="6" />
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const newPassword = Swal.getPopup()?.querySelector('#newPassword')?.value;
        const confirmPassword = Swal.getPopup()?.querySelector('#confirmPassword')?.value;

        if (!newPassword || newPassword.length < 6) {
          Swal.showValidationMessage('Password must be at least 6 characters long.');
          return false;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Passwords do not match.');
          return false;
        }

        return { newPassword, confirmPassword };
      }
    });

    if (!values) return;

    try {
      await api.post(`/users/${user.id}/reset-password`, values);
      Swal.fire({ icon: 'success', title: 'Password reset', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Reset failed', text: err?.response?.data?.message || 'Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
              <FaUsers className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-sm text-ink-faint">Create, update, and manage every account. Passwords are never displayed.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700"
          >
            <FaPlus /> {showCreateForm ? 'Close' : 'Add user'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className="w-full rounded-xl border border-border-default bg-surface py-3 pl-11 pr-4 text-ink outline-none focus:border-brand-500"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {showCreateForm ? <CreateUserForm onCreated={() => { setShowCreateForm(false); loadUsers(); }} /> : null}
      </div>

      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">Team roster</h3>
          <ExportButtons columns={EXPORT_COLUMNS} rows={pagedUsers} filename="users" />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-faint">
              <tr>
                <th className="py-3">Nom</th>
                <th className="py-3">Prenom</th>
                <th className="py-3">Email</th>
                <th className="py-3">Telephone</th>
                <th className="py-3">Role</th>
                <th className="py-3">Date de creation</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((u) => (
                <tr key={u.id} className="border-t border-border-default">
                  <td className="py-3 text-ink">{u.lastName}</td>
                  <td className="py-3 text-ink">{u.firstName}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.phone || '—'}</td>
                  <td className="py-3">
                    <span className="rounded-full border border-border-default px-3 py-1 text-xs uppercase tracking-wide text-ink-muted">{u.roleName}</span>
                  </td>
                  <td className="py-3">{formatDateTime(u.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => askAndUpdateUser(u)} className="flex items-center gap-1.5 rounded-lg bg-surface-3 px-3 py-2 text-ink transition hover:bg-border-default">
                        <FaUserEdit /> Edit
                      </button>
                      <button type="button" onClick={() => askAndResetPassword(u)} className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-ink transition hover:bg-surface-3">
                        <FaKey /> Reset password
                      </button>
                      <button type="button" onClick={() => askAndDeleteUser(u)} className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-2 text-rose-600 transition hover:bg-rose-500/10">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !pagedUsers.length ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-ink-faint">No users found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} totalElements={users.length} onPageChange={setPage} />
      </div>
    </div>
  );
}

function CreateUserForm({ onCreated }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', roleName: 'AGENT' } });

  const password = watch('password');

  const onSubmit = async (values) => {
    try {
      await api.post('/users', values);
      reset();
      Swal.fire({ icon: 'success', title: 'User created', timer: 1200, showConfirmButton: false });
      onCreated();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Creation failed', text: err?.response?.data?.message || 'Please check the form and try again.' });
    }
  };

  return (
    <form className="mt-6 grid gap-4 rounded-2xl border border-border-default bg-surface p-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" placeholder="First name" {...register('firstName', { required: true })} />
        {errors.firstName ? <p className="mt-1 text-xs text-rose-500">First name is required.</p> : null}
      </div>
      <div>
        <input className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" placeholder="Last name" {...register('lastName', { required: true })} />
        {errors.lastName ? <p className="mt-1 text-xs text-rose-500">Last name is required.</p> : null}
      </div>
      <div>
        <input className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" placeholder="Email" type="email" {...register('email', { required: true })} />
        {errors.email ? <p className="mt-1 text-xs text-rose-500">A valid email is required.</p> : null}
      </div>
      <input className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" placeholder="Phone" {...register('phone')} />
      <div>
        <input className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" placeholder="Password" type="password" {...register('password', { required: true, minLength: 6 })} />
        {errors.password ? <p className="mt-1 text-xs text-rose-500">Password must be at least 6 characters.</p> : null}
      </div>
      <div>
        <input
          className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
          placeholder="Confirm password"
          type="password"
          {...register('confirmPassword', { required: true, validate: (value) => value === password || 'Passwords do not match' })}
        />
        {errors.confirmPassword ? <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p> : null}
      </div>
      <select className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink md:col-span-2" {...register('roleName')}>
        {ROLES.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
        {isSubmitting ? 'Creating...' : 'Create account'}
      </button>
    </form>
  );
}
