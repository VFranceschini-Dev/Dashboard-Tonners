import { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Page } from '../types';
import {
  LayoutDashboard, Printer, Package, ArrowLeftRight, BarChart3, Bell, Menu, X, LogOut,
  Monitor, Users, Building2, FileText, ChevronRight, Settings, Sun, Moon, Server
} from 'lucide-react';
import { useState } from 'react';

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'equipments', label: 'Equipamientos', icon: <Monitor size={20} /> },
  { page: 'collaborators', label: 'Colaboradores', icon: <Users size={20} /> },
  { page: 'suppliers', label: 'Proveedores', icon: <Building2 size={20} /> },
  { page: 'vouchers', label: 'Comprobantes', icon: <FileText size={20} /> },
  { page: 'printers', label: 'Impresoras', icon: <Printer size={20} /> },
  { page: 'inventory', label: 'Inventario', icon: <Package size={20} /> },
  { page: 'movements', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
  { page: 'reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
  { page: 'mesh-test', label: 'Test MeshCentral', icon: <Server size={20} /> },
  { page: 'admin', label: 'Administración', icon: <Settings size={20} /> },
];

// ... resto del código con ThemeToggle component