import BuildUpProgressiveView from "./view/build-up-mode/BuildUpProgressiveView";
import TrackUpProgressiveView from "./view/track-up-mode/TrackUpProgressiveView";
import type { SettingsData } from "../shared/type";

type DashboardPageProps = {
  mode: SettingsData["mode"];
  currentTaskId: string | null;
};

export default function DashboardPage({ mode, currentTaskId }: DashboardPageProps) {
  if (mode === "trackup") {
    return <TrackUpProgressiveView currentTaskId={currentTaskId} />;
  }
  if (mode === "buildup") {
    return <BuildUpProgressiveView />;
  }

  return null;
}
