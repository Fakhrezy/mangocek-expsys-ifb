import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, IconButton, TextField, TextareaAutosize,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Box
} from '@mui/material';
import { Edit, Delete, Save, Cancel, Add } from '@mui/icons-material';

export default function KnowledgeBaseTable() {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ nama: '', gejala: [], pengendalian: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formBaru, setFormBaru] = useState({ nama: '', gejala: '', pengendalian: '' });
  const [tambahLoading, setTambahLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('http://localhost:5000/knowledge-base')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat knowledge base');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Yakin ingin menghapus penyakit ini?')) return;
    fetch(`http://localhost:5000/penyakit/${id}`, { method: 'DELETE' })
      .then(() => fetchData());
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditData({
      nama: item.nama,
      gejala: item.gejala.map(g => g.deskripsi),
      pengendalian: item.pengendalian
    });
  };

  const handleSave = () => {
    fetch(`http://localhost:5000/penyakit/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    }).then(() => {
      setEditId(null);
      fetchData();
    });
  };

  const handleCancel = () => setEditId(null);

  const handleTambah = () => {
    const payload = {
      nama: formBaru.nama,
      gejala: formBaru.gejala.split('\n').filter(Boolean),
      pengendalian: formBaru.pengendalian.split('\n').filter(Boolean)
    };

    setTambahLoading(true);
    fetch('http://localhost:5000/penyakit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      setFormBaru({ nama: '', gejala: '', pengendalian: '' });
      setTambahLoading(false);
      setOpenModal(false);
      fetchData();
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={1}>
  <Button
    variant="contained"
    color="primary"
    size="small"
    startIcon={<Add />}
    onClick={() => setOpenModal(true)}
  >
    Tambah Data
  </Button>
</Box>



      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Penyakit Baru</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nama Penyakit"
            value={formBaru.nama}
            onChange={(e) => setFormBaru({ ...formBaru, nama: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextareaAutosize
            minRows={3}
            placeholder="Gejala (satu per baris)"
            style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
            value={formBaru.gejala}
            onChange={(e) => setFormBaru({ ...formBaru, gejala: e.target.value })}
          />
          <TextareaAutosize
            minRows={3}
            placeholder="Pengendalian (satu per baris)"
            style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
            value={formBaru.pengendalian}
            onChange={(e) => setFormBaru({ ...formBaru, pengendalian: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">Batal</Button>
          <Button
            onClick={handleTambah}
            variant="contained"
            disabled={tambahLoading}
          >
            {tambahLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama Penyakit</TableCell>
              <TableCell>Gejala</TableCell>
              <TableCell>Pengendalian</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {editId === row.id ? (
                    <TextField
                      fullWidth
                      value={editData.nama}
                      onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                    />
                  ) : (
                    row.nama
                  )}
                </TableCell>
                <TableCell>
                  {editId === row.id ? (
                    <TextareaAutosize
                      minRows={3}
                      style={{ width: '100%' }}
                      value={editData.gejala.join('\n')}
                      onChange={(e) => setEditData({ ...editData, gejala: e.target.value.split('\n') })}
                    />
                  ) : (
                    <ul>{row.gejala.map((g, i) => <li key={i}>{g.deskripsi}</li>)}</ul>
                  )}
                </TableCell>
                <TableCell>
                  {editId === row.id ? (
                    <TextareaAutosize
                      minRows={3}
                      style={{ width: '100%' }}
                      value={editData.pengendalian.join('\n')}
                      onChange={(e) => setEditData({ ...editData, pengendalian: e.target.value.split('\n') })}
                    />
                  ) : (
                    <ul>{row.pengendalian.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  )}
                </TableCell>
                <TableCell>
                  {editId === row.id ? (
                    <>
                      <IconButton color="primary" onClick={handleSave}><Save /></IconButton>
                      <IconButton color="secondary" onClick={handleCancel}><Cancel /></IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEdit(row)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
