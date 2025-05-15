

import Link from "next/link"
import { useRouter } from 'next/router';
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { User } from '@/app/types/system';
import DashboardClient from "@/app/dashboard/DashboardClient";
import { NavigationButtons } from "@/components/navigation-buttons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, LineChart, PieChart, Target, TrendingUp, TrendingDown, Download } from "lucide-react"

export default function DashboardPage() {
  return <DashboardClient />;
}

