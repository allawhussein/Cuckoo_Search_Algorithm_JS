format short
clear all
clc


%% Phase 1: Input parameters
D = 2;              % Dimension of the problem
lb = [-5 -5];       % Lower bound of the variables
ub = [5 5];         % Upper bound of the variables 
N = 20;             % Population Size
n = N;
pa = 0.25;          % Discovery rate of alien eggs/solutions
max_iter = 100;     % Maximum number of iteration




%% Phase 2: Defining the objective function


%% Phase 3: Generate Initial Population randomly
nest(:,:) = zeros(N,D);
for i = 1:N
    for j = 1:D
        nest(i,j) = lb(:,j) + rand.*(ub(:,j)-lb(:,j));
    end
end
fx = fns(nest);

gamma = 1;
beta = 3/2;
sigma = ((gamma.*(1+beta).*sin(pi*beta/2))/(gamma.*((1+beta)/2).*beta*2^((beta-1)/2)))^(1/beta);




%% Phase 4: Cuckoo Search MAIN LOOP START

for iter = 1:max_iter
    [fnv, indf] = min(fx);
    best = nest(indf,:);
    
    for j=1:size(nest,1)
        
        %%% Levy flights by Mantegna's algorithm
        u = randn(size(s))*sigma;
        v = randn (size(s));
        step = u./abs(v).^(1/beta);
        Xnew = X+randn(size(s)).*0.01.*step.*(X-best);
        
        %% Check BOUNDS
        for kk=1:size(Xnew,2)
            if Xnew(kk)>ub(kk)
                Xnew(kk) = ub(kk);
            elseif Xnew(kk)<lb(kk)
                Xnew(kk) = lb(kk);
            end
        end
        %% PERFORM GREEDY SELECTION
        fnew = fns(Xnew);
        if fnew<fx(j,:)
            nest(j,:)=Xnew;
            fx(j,:)=fnew;
        end
        
    end   %%% end of the "for" loop
    %%% Find the current best
    [fmin,K1] = min(fx);
    best = nest (K1,:);
    
    
    %% Phase 5: Replace some nests by constructingcnew solutions/nests
    % Replace some not-so-good nests by constructingcnew solutions/nests
    % A fraction of worse nests are discovered with a probability "pa"
    
    K = rand(size(nest))<pa;
    
    stepsizeK = rand*(nest(randperm(n),:)-nest(randperm(n),:));
    
    new_nest = nest+stepsizeK.*K;
    
    %% Check BOUNDS
    for ii=1:size(nest,1)
        s = new_nest(ii,:);
        for kk=1:size(s,2)
            if s(kk)>ub(kk)
                s(kk) = ub(kk);
            elseif s(kk)<lb(kk)
                s(kk) = lb(kk);
            end
        end
        new_nest(ii,:) = s;
        
        %% PERFORM GREEDY SELECTION
        fnew = fns(s);
        if fnew<fx(ii,:)
            nest(ii,:)=s;
            fx(ii,:)=fnew;
        end
        
    end   %%% end of the "for" loop
    
    %% Phase 6: MEMORIZE THE BEST
    [optval, optind] = min(fx);
    BestFx(iter) = optval;
    BestX(iter,:) = nest(optind,:);
    
    % Show Iteration Information
    disp(['Iteration' num2str(iter) ':Best Cost = ' num2str(BestFx(iter)) '<br>']);
    
    
    %% Pase 7: PLOTING THE RESULT
    
    plot(BestFx, 'LineWidth', 2);
    xlabel('Iteration Number');
    ylabel('Fitness value')
    title('Convergence Vs Iteration')
    grid on
    
end   %%% END OF THE ITERATION LOOP
        