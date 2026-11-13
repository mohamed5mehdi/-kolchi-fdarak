import { Route, Routes } from 'react-router'
import { AppShell } from './AppShell'
import { NotFound } from './NotFound'
import { AboutPage } from '../features/about/AboutPage'
import { BookingPage } from '../features/booking/BookingPage'
import { GuidePage } from '../features/guide/GuidePage'
import { HomePage } from '../features/home/HomePage'
import { OfficesPage } from '../features/offices/OfficesPage'
import { ReportPage } from '../features/report/ReportPage'
import { PreparePage } from '../features/services/PreparePage'
import { ServiceDetailPage } from '../features/services/ServiceDetailPage'
import { ServicesPage } from '../features/services/ServicesPage'
import { TrackingPage } from '../features/tracking/TrackingPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="signaler" element={<ReportPage />} />
        <Route path="suivi" element={<TrackingPage />} />
        <Route path="suivi/:ref" element={<TrackingPage />} />
        <Route path="demarches" element={<ServicesPage />} />
        <Route path="demarches/:id" element={<ServiceDetailPage />} />
        <Route path="demarches/:id/preparer" element={<PreparePage />} />
        <Route path="rendez-vous" element={<BookingPage />} />
        <Route path="orientation" element={<GuidePage />} />
        <Route path="guichets" element={<OfficesPage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
