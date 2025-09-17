/**
 * Central export point for all components
 *
 * Components are organized into subdirectories:
 * - /game - Game-specific components
 * - /ui - Reusable UI components
 * - /layout - Layout components
 */

// UI Components
export { Button, ButtonGroup } from './ui/Button';
export { Card, CardHeader, CardBody, CardFooter, CardGrid } from './ui/Card';
export { Modal, ModalFooter } from './ui/Modal';
export { ProgressBar, MultiProgressBar, CircularProgress } from './ui/ProgressBar';

// Layout Components
export { Container, Section, Grid, Flex, Spacer } from './layout/Container';
export { Header, Breadcrumbs } from './layout/Header';

// Game Components
export { StatusBars, OptimalZoneIndicator, GameStats } from './game/StatusBars';
export { CaffeineBar, CaffeineGauge } from './game/CaffeineBar';
export { HealthBar, HealthMeter, HealthTrend } from './game/HealthBar';
export { DrinkSelector } from './game/DrinkSelector';