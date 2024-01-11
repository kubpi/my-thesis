import { Navbar } from "../componenets/Nabar";
import TabsBar from "../componenets/BetTabs/TabsBar";

export default function Betting() {
  const rankings = [
    { name: "Alice", points: 150 },
    { name: "Bob", points: 120 },
    { name: "Charlie", points: 110 },
    // Additional rankings
    { name: "Dave", points: 100 },
    { name: "Eve", points: 90 },
    { name: "Frank", points: 85 },
    // ... more rankings if needed
  ];
  return (
    <>
      <Navbar></Navbar>
      <TabsBar></TabsBar>
    </>
  );
}
