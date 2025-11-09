-- Function to atomically check and update stock
-- This prevents race conditions when multiple orders are placed simultaneously
CREATE OR REPLACE FUNCTION public.decrement_stock(
  product_id_param uuid,
  quantity_param integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  -- Lock the row for update to prevent concurrent modifications
  SELECT stock_quantity INTO current_stock
  FROM public.products
  WHERE id = product_id_param
  FOR UPDATE;
  
  -- Check if enough stock is available
  IF current_stock IS NULL THEN
    RETURN false; -- Product not found
  END IF;
  
  IF current_stock < quantity_param THEN
    RETURN false; -- Insufficient stock
  END IF;
  
  -- Update stock atomically
  UPDATE public.products
  SET stock_quantity = stock_quantity - quantity_param,
      updated_at = now()
  WHERE id = product_id_param;
  
  RETURN true; -- Success
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO authenticated, anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.decrement_stock IS 'Atomically decrements product stock. Returns true if successful, false if insufficient stock or product not found.';








