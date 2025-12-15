import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  Button,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { z } from "zod";
const initialForm = { phone_number: "", country_code: "" };

const Phone = () => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [sessionId, setSessionId] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const phoneSchema = z.object({
    phone_number: z.string().min(1, "Phone number is required"),
    country_code: z.string().min(1, "Country code is required"),
  });

  const getShopDomain = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("shop") || "";
  };

  // Fetch shopify_session_id from backend
  const fetchSessionId = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/phone/session/current`, {
        method: "GET",
        headers: {
          "X-Shopify-Shop-Domain": getShopDomain(),
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSessionId(data.session._id);
      } else if (data.installUrl) {
        window.location.href = data.installUrl;
      } else {
        setSessionId(null);
      }
    } catch {
      setSessionId(null);
    }
  };

  const API_BASE_URL = "https://whatsapp-mern-backend-sidn.onrender.com/api";

  // prettier-ignore
  const getRequestHeaders = () => ({
    "Content-Type": "application/json",
    "Accept": "application / json",
    "ngrok-skip-browser-warning": "true",
    "X-Requested-With": "XMLHttpRequest",
  });

  const fetchPhones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/phone`, {
        method: "GET",
        credentials: "include",
        headers: getRequestHeaders(),
      });

      const data = await res.json();
      if (!data.status && !res.ok) {
        const responseMsg = JSON.stringify(data);
        const parse = JSON.parse(responseMsg);
        setSnackbar({
          open: true,
          message: parse.message,
          severity: "error",
        });
      }

      setPhones(data.data || []);
    } catch (err) {
      setPhones([]); // Clear the list on error
    }
    setLoading(false);
  };

  const handleOpenModal = (phone) => {
    if (phone) {
      setEditMode(true);
      setForm({
        phone_number: phone.phone_number,
        country_code: phone.country_code,
      });
      setSelectedId(phone._id);
    } else {
      setEditMode(false);
      setForm(initialForm);
      setSelectedId(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setSelectedId(null);
    setFormErrors({});
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editMode
        ? `${API_BASE_URL}/phone/${selectedId}`
        : `${API_BASE_URL}/phone/add`;
      const method = editMode ? "PUT" : "POST";

      // Clear previous errors
      setFormErrors({});

      // Zod validation
      const result = phoneSchema.safeParse(form);
      if (!result.success) {
        const formattedErrors = result.error.format();
        const errors = {};

        if (formattedErrors.phone_number) {
          errors.phone_number = formattedErrors.phone_number._errors[0];
        }
        if (formattedErrors.country_code) {
          errors.country_code = formattedErrors.country_code._errors[0];
        }

        setFormErrors(errors);
        setSnackbar({
          open: true,
          message: "Please fix the form errors",
          severity: "error",
        });
        setLoading(false);
        return;
      }
      // Add shopify_session_id to payload
      const payload = {
        ...form,
        ...(sessionId && { shopify_session_id: sessionId }),
      };
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        credentials: "include",
        headers: getRequestHeaders(),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (Array.isArray(data)) {
          setSnackbar({
            open: true,
            message: Array.isArray(data)
              ? JSON.stringify(data.join(" | "))
              : String(data),
            severity: "error",
          });
        }
        setLoading(false);
        return;
      }
      if (data) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success",
        });
      }
      fetchPhones();
      handleCloseModal();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/phone/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getRequestHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      fetchPhones();
      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete phone",
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessionId();
    fetchPhones();
  }, []);

  return (
    <Box sx={{ background: "#f5f6fa", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4" color="primary" fontWeight={700}>
              Phone Management
            </Typography>
            <Fab
              color="primary"
              size="medium"
              aria-label="add"
              onClick={() => handleOpenModal()}
              sx={{ boxShadow: 2 }}
            >
              <Add />
            </Fab>
          </Box>
          <TableContainer sx={{ maxHeight: 600, overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3e6f0" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Phone Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Country Code</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phones.map((phone) => (
                  <TableRow key={phone._id}>
                    <TableCell>{phone.phone_number}</TableCell>
                    <TableCell>{phone.country_code}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(phone)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(phone._id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {phones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="textSecondary">
                        No phones found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth>
          <DialogTitle>{editMode ? "Edit Phone" : "Add Phone"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Phone Number"
              value={form.phone_number}
              type="number"
              onChange={(e) => {
                // Always store as string to avoid losing leading zeros
                handleChange("phone_number", e.target.value.toString());
                if (formErrors.phone_number) {
                  setFormErrors((prev) => ({ ...prev, phone_number: "" }));
                }
              }}
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Country Code"
              value={form.country_code}
              onChange={(e) => {
                handleChange("country_code", e.target.value);
                if (formErrors.country_code) {
                  setFormErrors((prev) => ({ ...prev, country_code: "" }));
                }
              }}
              error={!!formErrors.country_code}
              helperText={formErrors.country_code}
              fullWidth
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading}
            >
              {editMode ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={snackbar.severity === "error" ? 5000 : 3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Phone;
