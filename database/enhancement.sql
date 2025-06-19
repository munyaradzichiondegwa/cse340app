CREATE TABLE IF NOT EXISTS public.review (
    review_id SERIAL PRIMARY KEY,
    inv_id INT NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    review_rating INT NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
    review_date TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups by inventory and account
CREATE INDEX IF NOT EXISTS idx_review_inv_id ON public.review (inv_id);
CREATE INDEX IF NOT EXISTS idx_review_account_id ON public.review (account_id);