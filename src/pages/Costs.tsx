import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Users, Copy, Download, Plus, Minus, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Costs = () => {
  const [budgetDrawerOpen, setBudgetDrawerOpen] = useState(false);
  const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
  const [budgetData, setBudgetData] = useState({
    transport: 800,
    lodging: 1200,
    food: 600,
    activities: 400,
    miscellaneous: 200
  });
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Alice', expenses: [{ category: 'Hotel', amount: 300 }, { category: 'Dinner', amount: 80 }] },
    { id: 2, name: 'Bob', expenses: [{ category: 'Gas', amount: 120 }, { category: 'Lunch', amount: 45 }] },
    { id: 3, name: 'Charlie', expenses: [{ category: 'Tickets', amount: 200 }, { category: 'Breakfast', amount: 30 }] }
  ]);
  const [splitMethod, setSplitMethod] = useState('equal');

  const totalBudget = Object.values(budgetData).reduce((sum, value) => sum + value, 0);
  
  const totalExpenses = participants.reduce((total, participant) => 
    total + participant.expenses.reduce((sum, expense) => sum + expense.amount, 0), 0
  );

  const expensePerPerson = splitMethod === 'equal' ? totalExpenses / participants.length : 0;

  const calculateBalance = (participant) => {
    const paid = participant.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return paid - expensePerPerson;
  };

  const updateBudgetCategory = (category, value) => {
    setBudgetData(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const copyResults = () => {
    const results = participants.map(p => {
      const balance = calculateBalance(p);
      return `${p.name}: ${balance >= 0 ? `+$${balance.toFixed(2)}` : `-$${Math.abs(balance).toFixed(2)}`}`;
    }).join('\n');
    
    navigator.clipboard.writeText(results);
    toast({
      title: "Results copied!",
      description: "Expense split results copied to clipboard"
    });
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Travel Costs</h1>
            <p className="text-muted-foreground">Manage your travel budget and split expenses with ease</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Travel Budget Estimation Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border"
              onClick={() => setBudgetDrawerOpen(true)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Travel Budget Estimation</CardTitle>
                <CardDescription>
                  Plan and estimate your travel costs across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Budget</span>
                    <span className="font-semibold text-primary">${totalBudget}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: '75%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Click to manage your budget breakdown</p>
                </div>
              </CardContent>
            </Card>

            {/* Travel Expense Splitting Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border"
              onClick={() => setExpenseDrawerOpen(true)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Travel Expense Splitting</CardTitle>
                <CardDescription>
                  Track expenses and split costs among travel companions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Expenses</span>
                    <span className="font-semibold text-secondary-foreground">${totalExpenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Per Person</span>
                    <span className="font-semibold">${expensePerPerson.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Click to manage expense splitting</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Budget Estimation Drawer */}
      <Drawer open={budgetDrawerOpen} onOpenChange={setBudgetDrawerOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Travel Budget Estimation
            </DrawerTitle>
            <DrawerDescription>
              Estimate costs for each category of your trip
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {Object.entries(budgetData).map(([category, amount]) => (
                <div key={category} className="space-y-2">
                  <Label htmlFor={category} className="capitalize text-sm font-medium">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={category}
                      type="number"
                      value={amount}
                      onChange={(e) => updateBudgetCategory(category, e.target.value)}
                      className="pl-10"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Budget</span>
                <span className="text-2xl font-bold text-primary">${totalBudget}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBudgetDrawerOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast({
                  title: "Budget saved!",
                  description: "Your travel budget has been updated"
                });
                setBudgetDrawerOpen(false);
              }}>
                Save Budget
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Expense Splitting Drawer */}
      <Drawer open={expenseDrawerOpen} onOpenChange={setExpenseDrawerOpen}>
        <DrawerContent className="max-w-2xl mx-auto">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Travel Expense Splitting
            </DrawerTitle>
            <DrawerDescription>
              Track and split expenses among your travel group
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6 space-y-6">
            <div className="flex gap-2">
              <Button
                variant={splitMethod === 'equal' ? 'default' : 'outline'}
                onClick={() => setSplitMethod('equal')}
                className="flex-1"
              >
                Equal Split
              </Button>
              <Button
                variant={splitMethod === 'custom' ? 'default' : 'outline'}
                onClick={() => setSplitMethod('custom')}
                className="flex-1"
              >
                Custom Split
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Participants & Expenses</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => {
                    const paid = participant.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                    const balance = calculateBalance(participant);
                    
                    return (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell>${paid}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={balance >= 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {balance >= 0 ? `+$${balance.toFixed(2)}` : `-$${Math.abs(balance).toFixed(2)}`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span className="font-semibold">${totalExpenses}</span>
              </div>
              <div className="flex justify-between">
                <span>Per Person (Equal Split)</span>
                <span className="font-semibold">${expensePerPerson.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={copyResults} className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Results
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={() => setExpenseDrawerOpen(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

    </>
  );
};

export default Costs;