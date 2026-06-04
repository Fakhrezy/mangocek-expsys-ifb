import * as React from 'react';
import Swal from 'sweetalert2';

import axios from 'axios';
import { createTheme } from '@mui/material/styles';
import {
  AppProvider,
  DashboardLayout,
  PageContainer,
} from '@toolpad/core';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import KnowledgeBaseTable from '../components/knowledgeBaseTable';


// Sidebar menu
const NAVIGATION = [
  { kind: 'header', title: 'Main' },
  { segment: 'dashboard', title: 'Dashboard', icon: <DashboardIcon /> },
  { segment: 'users', title: 'Users', icon: <PeopleIcon /> },
  { kind: 'divider' },
  { kind: 'header', title: 'Analytics' },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      { segment: 'sales', title: 'Diagnosa', icon: <DescriptionIcon /> },
      // { segment: 'traffic', title: 'Traffic', icon: <DescriptionIcon /> },
    ],
  },
  { segment: 'integrations', title: 'Penyakit', icon: <LayersIcon /> },
];

// Router mock
function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);
  return {
    pathname,
    searchParams: new URLSearchParams(),
    navigate: (path) => setPathname(String(path)),
  };
}

const theme = createTheme();

export default function DashboardPage() {
  const router = useDemoRouter('/dashboard');
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [errorUsers, setErrorUsers] = React.useState(null);
  const [jumlahDiagnosaHariIni, setJumlahDiagnosaHariIni] = React.useState(0);


  // Fetch user data
  React.useEffect(() => {
  if (router.pathname === '/users' || router.pathname === '/dashboard') {
    setLoadingUsers(true);
    axios.get('http://localhost:5000/users')
      .then((res) => {
        setUsers(res.data.users || []);
        setLoadingUsers(false);
      })
      .catch((err) => {
        setErrorUsers('Gagal memuat data pengguna');
        setLoadingUsers(false);
      });

    // Fetch hasil diagnosa
    axios.get('http://localhost:5000/hasil-diagnosa')
      .then((res) => {
        const all = res.data || [];
        const today = new Date().toISOString().split('T')[0];
        const jumlahHariIni = all.filter(item => item.waktu.startsWith(today)).length;
        setJumlahDiagnosaHariIni(jumlahHariIni);
      })
      .catch(() => {
        setJumlahDiagnosaHariIni(0);
      });
  }
}, [router.pathname]);


  // Dashboard content with enhanced grid
  const renderDashboardContent = () => (
    <Grid container spacing={2}>
      {/* Statistik Jumlah Pengguna */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#e8f5e9' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" color="primary">Pengguna</Typography>
            <PeopleIcon color="primary" />
          </Box>
          <Typography variant="h4" color="textPrimary" gutterBottom>{users.length}</Typography>
          <Typography variant="body2" color="textSecondary">Total pengguna terdaftar di sistem</Typography>
        </Paper>
      </Grid>

      {/* Statistik Diagnosa */}
<Grid item xs={12} sm={6} md={4}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#e8f5e9' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="h6" color="primary">Diagnosa</Typography>
      <BarChartIcon color="primary" />
    </Box>
    <Typography variant="h4" color="textPrimary" gutterBottom>
      Hari ini: {jumlahDiagnosaHariIni}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      Jumlah diagnosa yang dilakukan hari ini
    </Typography>
  </Paper>
</Grid>


      {/* Statistik Laporan */}
      {/* <Grid item xs={12} sm={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: '#fff3e0' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" color="primary">Laporan</Typography>
            <DescriptionIcon color="primary" />
          </Box>
          <Typography variant="h4" color="textPrimary" gutterBottom>Belum ada laporan</Typography>
          <Typography variant="body2" color="textSecondary">Laporan belum tersedia untuk saat ini</Typography>
        </Paper>
      </Grid> */}
    </Grid>
  );

  // User content with table
  const renderUsersContent = () => (
    <>
      {loadingUsers ? (
        <CircularProgress />
      ) : errorUsers ? (
        <Alert severity="error">{errorUsers}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );

function DiagnosaContent() {
  const [diagnosa, setDiagnosa] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    axios.get('http://localhost:5000/hasil-diagnosa')
      .then(res => {
        setDiagnosa(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Gagal memuat data diagnosa');
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Penyakit</TableCell>
            <TableCell>Skor</TableCell>
            <TableCell>Gejala</TableCell>
            <TableCell>Waktu</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {diagnosa.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.nama_penyakit}</TableCell>
              <TableCell>{(row.skor * 100).toFixed(0)}%</TableCell>
              <TableCell>{JSON.parse(row.gejala_terpilih).join(', ')}</TableCell>
              <TableCell>{new Date(row.waktu).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const contentByPath = {
  '/dashboard': renderDashboardContent,
  '/users': renderUsersContent,
  '/reports/sales': DiagnosaContent,
  '/integrations': KnowledgeBaseTable,
};

  const CurrentContent = contentByPath[router.pathname] || (() => <Typography>Page Not Found</Typography>);

  return (
  <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Custom Header */}
      <Box
  display="flex"
  alignItems="center"
  justifyContent="space-between"
  px={2}
  py={1}
  bgcolor="#e8f5e9"
  boxShadow={1}
  height="64px"
>
  <Box display="flex" alignItems="center">
    <img
      src="/images/logo.png"
      alt="Logo MangoCek"
      style={{ height: 40, marginRight: 12 }}
    />
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
      MangoCek
    </Typography>
  </Box>

  <button
  onClick={() => {
    Swal.fire({
      title: 'Yakin ingin logout?',
      text: "Sesi login Anda akan diakhiri.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
  }}
  style={{
    padding: '6px 14px',
    backgroundColor: '#e53935',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }}
>
  Logout
</button>

</Box>

      {/* Main Content */}
      <DashboardLayout>
        <PageContainer>
          <CurrentContent />
        </PageContainer>
      </DashboardLayout>
    </Box>
  </AppProvider>
);


}
